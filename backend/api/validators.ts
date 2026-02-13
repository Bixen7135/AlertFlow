import { z } from 'zod';

// Event filter and pagination schema
export const eventsQuerySchema = z.object({
  page: z.coerce.number().min(1).max(1000).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  type: z.enum(['weather', 'traffic', 'public_safety', 'health', 'utility', 'other']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['active', 'updated', 'resolved', 'cancelled']).optional(),
  district: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type EventsQuery = z.infer<typeof eventsQuerySchema>;

// Event detail params schema
export const eventParamsSchema = z.object({
  id: z.string().uuid('Invalid event ID format'),
});

export type EventParams = z.infer<typeof eventParamsSchema>;

// Source management schema (admin)
export const createSourceSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['rss', 'json', 'html']),
  url: z.string().url(),
  pollingIntervalSeconds: z.number().min(60).max(86400).default(300),
  enabled: z.boolean().default(true),
  config: z.record(z.unknown()).optional().default({}),
});

export type CreateSourceInput = z.infer<typeof createSourceSchema>;

export const updateSourceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['rss', 'json', 'html']).optional(),
  url: z.string().url().optional(),
  pollingIntervalSeconds: z.number().min(60).max(86400).optional(),
  enabled: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
});

export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;

// Manual event creation schema (admin)
export const createEventSchema = z.object({
  sourceId: z.string().uuid(),
  originalId: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  type: z.enum(['weather', 'traffic', 'public_safety', 'health', 'utility', 'other']),
  status: z.enum(['active', 'updated', 'resolved', 'cancelled']).default('active'),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  district: z.string().optional(),
  locationName: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  originalUrl: z.string().url().optional(),
  originalData: z.record(z.unknown()).optional().default({}),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

// Map query schema
export const mapEventsQuerySchema = z.object({
  bounds: z.string().optional(), // Bounding box: "minLng,minLat,maxLng,maxLat"
  type: z.enum(['weather', 'traffic', 'public_safety', 'health', 'utility', 'other']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export type MapEventsQuery = z.infer<typeof mapEventsQuerySchema>;
