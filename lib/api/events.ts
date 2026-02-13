import { apiClient } from './client';
import type {
  EventDetail,
  EventListItem,
  EventUpdate,
  MapEventsResponse,
  PaginatedResponse,
  EventsQuery,
  MapEventsQuery,
} from './types';

// Re-export types for convenience
export type {
  EventDetail,
  EventListItem,
  EventUpdate,
  MapEventsResponse,
  PaginatedResponse,
  EventsQuery,
  MapEventsQuery,
};

/**
 * Get paginated list of events with filtering
 * Endpoint: GET /api/v1/events
 */
export async function getEvents(
  query: EventsQuery = {}
): Promise<PaginatedResponse<EventListItem>> {
  const params: Record<string, string | number> = {
    page: query.page || 1,
    limit: query.limit || 50,
  };

  if (query.type) params.type = query.type;
  if (query.severity) params.severity = query.severity;
  if (query.status) params.status = query.status;
  if (query.district) params.district = query.district;
  if (query.startDate) params.startDate = query.startDate;
  if (query.endDate) params.endDate = query.endDate;

  return apiClient.get<PaginatedResponse<EventListItem>>('/api/v1/events', params);
}

/**
 * Get single event by ID with update history
 * Endpoint: GET /api/v1/events/:id
 */
export async function getEventById(id: string): Promise<{ data: EventDetail }> {
  return apiClient.get<{ data: EventDetail }>(`/api/v1/events/${id}`);
}

/**
 * Get event update history
 * Endpoint: GET /api/v1/events/:id/history
 */
export async function getEventHistory(
  id: string,
  page = 1,
  limit = 20
): Promise<{ data: EventUpdate[]; meta: { page: number; limit: number } }> {
  return apiClient.get<{ data: EventUpdate[]; meta: { page: number; limit: number } }>(
    `/api/v1/events/${id}/history`,
    { page, limit }
  );
}

/**
 * Get events as GeoJSON for map display
 * Endpoint: GET /api/v1/map/events
 */
export async function getMapEvents(
  query: MapEventsQuery = {}
): Promise<MapEventsResponse> {
  const params: Record<string, string> = {};

  if (query.bounds) params.bounds = query.bounds;
  if (query.type) params.type = query.type;
  if (query.severity) params.severity = query.severity;

  return apiClient.get<MapEventsResponse>('/api/v1/map/events', params);
}

/**
 * React Query hooks (if using react-query)
 * These can be used with Next.js data fetching or react-query
 */
export const eventsKeys = {
  all: ['events'] as const,
  lists: () => [...eventsKeys.all, 'list'] as const,
  list: (query: EventsQuery) => [...eventsKeys.lists(), query] as const,
  details: () => [...eventsKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventsKeys.details(), id] as const,
  history: (id: string) => [...eventsKeys.all, 'history', id] as const,
  map: (query: MapEventsQuery) => [...eventsKeys.all, 'map', query] as const,
};
