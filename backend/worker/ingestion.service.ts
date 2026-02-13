import { eq, and, sql } from 'drizzle-orm';
import { getDb, schema } from '../lib/db';
import { getTelegramQueue } from '../lib/queue';
import { computeFingerprint, hasMeaningfulChange, extractChangedFields } from '../shared/event-types';
import type { NormalizedEvent } from '../shared/event-types';
import type { Source } from '../shared/schema';

interface IngestionResult {
  sourceId: string;
  eventsFound: number;
  eventsCreated: number;
  eventsUpdated: number;
  errors: string[];
}

export class IngestionService {
  /**
   * Process normalized events from a source
   */
  async processEvents(
    source: Source,
    normalizedEvents: NormalizedEvent[]
  ): Promise<IngestionResult> {
    const db = getDb();
    const errors: string[] = [];
    let eventsCreated = 0;
    let eventsUpdated = 0;

    for (const normalized of normalizedEvents) {
      try {
        const result = await this.upertEvent(source.id, normalized);
        if (result.created) {
          eventsCreated++;
          // Queue Telegram notification for new events
          await this.queueNotification(normalized);
        } else if (result.updated) {
          eventsUpdated++;
          // Queue Telegram notification for meaningful changes
          if (result.shouldNotify) {
            await this.queueNotification(normalized);
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Event ${normalized.originalId}: ${message}`);
      }
    }

    return {
      sourceId: source.id,
      eventsFound: normalizedEvents.length,
      eventsCreated,
      eventsUpdated,
      errors,
    };
  }

  /**
   * Insert or update an event with change detection
   */
  private async upertEvent(
    sourceId: string,
    normalized: NormalizedEvent
  ): Promise<{
    created: boolean;
    updated: boolean;
    shouldNotify: boolean;
  }> {
    const db = getDb();
    const fingerprint = computeFingerprint(normalized);

    // Check for existing event
    const existing = await db.query.events.findFirst({
      where: eq(schema.events.fingerprint, fingerprint),
    });

    if (!existing) {
      // Create new event
      await db.insert(schema.events).values({
        fingerprint,
        sourceId: normalized.sourceId,
        originalId: normalized.originalId,
        title: normalized.title,
        description: normalized.description,
        severity: normalized.severity,
        type: normalized.type,
        status: normalized.status,
        startTime: normalized.startTime,
        endTime: normalized.endTime,
        district: normalized.district,
        locationName: normalized.locationName,
        latitude: normalized.latitude?.toString(),
        longitude: normalized.longitude?.toString(),
        originalUrl: normalized.originalUrl,
        originalData: normalized.originalData as any,
      });

      return { created: true, updated: false, shouldNotify: true };
    }

    // Check for meaningful changes
    const meaningfulChange = hasMeaningfulChange(existing, normalized);

    // Update existing event
    await db
      .update(schema.events)
      .set({
        title: normalized.title,
        description: normalized.description,
        status: normalized.status,
        endTime: normalized.endTime,
        originalData: normalized.originalData as any,
        updatedAt: new Date(),
      })
      .where(eq(schema.events.fingerprint, fingerprint));

    // Record update if meaningful
    if (meaningfulChange) {
      const changedFields = extractChangedFields(existing, normalized);
      await db.insert(schema.eventUpdates).values({
        eventId: existing.id,
        changedFields,
        previousData: {
          severity: existing.severity,
          status: existing.status,
          latitude: existing.latitude,
          longitude: existing.longitude,
          startTime: existing.startTime,
        },
        newData: {
          severity: normalized.severity,
          status: normalized.status,
          latitude: normalized.latitude?.toString(),
          longitude: normalized.longitude?.toString(),
          startTime: normalized.startTime,
        },
      });
    }

    return {
      created: false,
      updated: true,
      shouldNotify: meaningfulChange,
    };
  }

  /**
   * Queue Telegram notification for an event
   */
  private async queueNotification(event: NormalizedEvent): Promise<void> {
    try {
      const queue = getTelegramQueue();
      await queue.add(
        `event-${event.sourceId}-${event.originalId}`,
        {
          eventId: `${event.sourceId}-${event.originalId}`,
          eventType: event.type,
          severity: event.severity,
          title: event.title,
        }
      );
    } catch (error) {
      console.error('Failed to queue notification:', error);
    }
  }

  /**
   * Log ingestion attempt
   */
  async logIngestion(
    sourceId: string,
    result: IngestionResult,
    status: 'success' | 'partial' | 'error'
  ): Promise<void> {
    const db = getDb();

    await db.insert(schema.ingestionLogs).values({
      sourceId,
      status,
      message: result.errors.length > 0
        ? `Completed with ${result.errors.length} errors`
        : 'Completed successfully',
      eventsFound: result.eventsFound,
      eventsCreated: result.eventsCreated,
      eventsUpdated: result.eventsUpdated,
      completedAt: new Date(),
    });
  }

  /**
   * Update source poll timestamps
   */
  async updateSourceTimestamps(
    sourceId: string,
    success: boolean
  ): Promise<void> {
    const db = getDb();

    await db
      .update(schema.sources)
      .set({
        lastPollAt: new Date(),
        ...(success ? { lastSuccessAt: new Date(), failureCount: 0 } : {
          failureCount: sql`failure_count + 1`,
        }),
      })
      .where(eq(schema.sources.id, sourceId));

    // Auto-disable after 10 consecutive failures
    if (!success) {
      const source = await db.query.sources.findFirst({
        where: eq(schema.sources.id, sourceId),
      });

      if (source && source.failureCount >= 9) {
        // This update will push it to 10
        await db
          .update(schema.sources)
          .set({ enabled: false })
          .where(eq(schema.sources.id, sourceId));
        console.log(`Source ${source.name} auto-disabled after 10 failures`);
      }
    }
  }
}

export const ingestionService = new IngestionService();
