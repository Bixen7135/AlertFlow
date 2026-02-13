/**
 * Unified Event Model - Internal representation after normalization
 */

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type EventType = 'weather' | 'traffic' | 'public_safety' | 'health' | 'utility' | 'other';
export type EventStatus = 'active' | 'updated' | 'resolved' | 'cancelled';
export type SourceType = 'rss' | 'json' | 'html';

export interface NormalizedEvent {
  sourceId: string;
  originalId: string;
  title: string;
  description?: string;
  severity: Severity;
  type: EventType;
  status: EventStatus;
  startTime: Date;
  endTime?: Date;
  district?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  originalUrl?: string;
  originalData: Record<string, unknown>;
}

export interface RawEvent {
  // The raw event data from source - structure varies by source type
  [key: string]: unknown;
}

export interface SourceAdapter {
  fetch(): Promise<RawEvent[]>;
  normalize(raw: RawEvent): NormalizedEvent;
}

export interface SourceConfig {
  pollingIntervalSeconds: number;
  enabled: boolean;
  // Source-specific config
  jsonPath?: string; // For JSON sources
  selector?: string; // For HTML sources
}

/**
 * Compute deterministic fingerprint for deduplication
 * Excludes description/title to allow source corrections without creating duplicates
 */
export function computeFingerprint(event: NormalizedEvent): string {
  const fingerprintData = `${event.sourceId}|${event.originalId}|${event.type}|${event.startTime.toISOString()}`;
  // Simple hash function - in production use crypto.subtle.digest for SHA-256
  let hash = 0;
  for (let i = 0; i < fingerprintData.length; i++) {
    const char = fingerprintData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `fp_${Math.abs(hash).toString(16)}`;
}

/**
 * Check if changes to an event are meaningful enough to trigger notifications
 */
export function hasMeaningfulChange(
  existing: {
    severity: Severity;
    status: EventStatus;
    latitude?: string | null;
    longitude?: string | null;
    startTime: Date;
  },
  normalized: NormalizedEvent
): boolean {
  // Normalize null to undefined for comparison
  const existingLat = existing.latitude ?? undefined;
  const existingLon = existing.longitude ?? undefined;
  const normalizedLat = normalized.latitude?.toString();
  const normalizedLon = normalized.longitude?.toString();

  return (
    existing.severity !== normalized.severity ||
    existing.status !== normalized.status ||
    existingLat !== normalizedLat ||
    existingLon !== normalizedLon ||
    Math.abs(existing.startTime.getTime() - normalized.startTime.getTime()) > 60000 // 1 minute
  );
}

/**
 * Extract changed fields between two events
 */
export function extractChangedFields(
  existing: Record<string, unknown>,
  normalized: NormalizedEvent
): string[] {
  const changes: string[] = [];
  const normalizedRecord = normalized as Record<string, unknown>;

  for (const key of Object.keys(normalizedRecord)) {
    if (key === 'originalData') continue;
    const existingValue = existing[key];
    const newValue = normalizedRecord[key];

    if (JSON.stringify(existingValue) !== JSON.stringify(newValue)) {
      changes.push(key);
    }
  }

  return changes;
}
