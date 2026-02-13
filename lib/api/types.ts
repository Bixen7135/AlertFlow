/**
 * API Types matching backend schema
 * Reference: backend/api/validators.ts, backend/api/services/event.service.ts
 */

// Event types from backend
export type EventType = 'weather' | 'traffic' | 'public_safety' | 'health' | 'utility' | 'other';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type EventStatus = 'active' | 'updated' | 'resolved' | 'cancelled';

// Base event interface
export interface Event {
  id: string;
  fingerprint: string;
  sourceId: string;
  title: string;
  description: string | null;
  severity: Severity;
  type: EventType;
  status: EventStatus;
  startTime: string; // ISO date string
  endTime: string | null;
  district: string | null;
  locationName: string | null;
  latitude: string | null;
  longitude: string | null;
  originalUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Event list item (for feed)
export interface EventListItem extends Omit<Event, 'originalId' | 'originalData' | 'updates'> {}

// Event detail with updates
export interface EventDetail extends Event {
  originalId: string;
  originalData: Record<string, unknown> | null;
  updates: EventUpdate[];
}

// Event update history
export interface EventUpdate {
  id: string;
  changedFields: string[];
  detectedAt: string;
}

// Pagination metadata
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Query parameters for events endpoint
export interface EventsQuery {
  page?: number;
  limit?: number;
  type?: EventType;
  severity?: Severity;
  status?: EventStatus;
  district?: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

// Map event feature (GeoJSON)
export interface MapEventFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    id: string;
    title: string;
    description: string | null;
    severity: Severity;
    type: EventType;
    startTime: string;
    district: string | null;
    locationName: string | null;
  };
}

// Map events response (GeoJSON FeatureCollection)
export interface MapEventsResponse {
  type: 'FeatureCollection';
  features: MapEventFeature[];
}

// Map query parameters
export interface MapEventsQuery {
  bounds?: string; // "minLng,minLat,maxLng,maxLat"
  type?: EventType;
  severity?: Severity;
}

// API error response
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  checks: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
  };
  timestamp: string;
}
