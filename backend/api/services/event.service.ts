import { and, asc, desc, eq, gte, lte, sql, like, or } from 'drizzle-orm';
import { getDb, schema } from '../../lib/db';
import type { EventsQuery } from '../validators';

// Enum value lists matching schema definitions
const EVENT_TYPES = ['weather', 'traffic', 'public_safety', 'health', 'utility', 'other'] as const;
const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
const EVENT_STATUSES = ['active', 'updated', 'resolved', 'cancelled'] as const;

type EventType = typeof EVENT_TYPES[number];
type Severity = typeof SEVERITIES[number];
type EventStatus = typeof EVENT_STATUSES[number];

// Type guards
function isValidEventType(value: string): value is EventType {
  return EVENT_TYPES.includes(value as EventType);
}

function isValidSeverity(value: string): value is Severity {
  return SEVERITIES.includes(value as Severity);
}

function isValidEventStatus(value: string): value is EventStatus {
  return EVENT_STATUSES.includes(value as EventStatus);
}

interface PaginationOptions {
  page: number;
  limit: number;
}

interface FilterOptions {
  type?: string;
  severity?: string;
  status?: string;
  district?: string;
  startDate?: Date;
  endDate?: Date;
}

interface EventListItem {
  id: string;
  fingerprint: string;
  sourceId: string;
  title: string;
  description: string | null;
  severity: string;
  type: string;
  status: string;
  startTime: Date;
  endTime: Date | null;
  district: string | null;
  locationName: string | null;
  latitude: string | null;
  longitude: string | null;
  originalUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface EventDetail extends EventListItem {
  originalId: string;
  originalData: Record<string, unknown> | null;
  updates: Array<{
    id: string;
    changedFields: string[];
    detectedAt: Date;
  }>;
}

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class EventService {
  /**
   * Get paginated list of events with optional filters
   */
  async getEvents(filters: FilterOptions, pagination: PaginationOptions): Promise<PaginatedResult<EventListItem>> {
    const db = getDb();
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // Build where clause
    const conditions: any[] = [];

    if (filters.type && isValidEventType(filters.type)) {
      conditions.push(eq(schema.events.type, filters.type));
    }

    if (filters.severity && isValidSeverity(filters.severity)) {
      conditions.push(eq(schema.events.severity, filters.severity));
    }

    if (filters.status && isValidEventStatus(filters.status)) {
      conditions.push(eq(schema.events.status, filters.status));
    }

    if (filters.district) {
      conditions.push(sql`${schema.events.district} ILIKE ${`%${filters.district}%`}`);
    }

    if (filters.startDate) {
      conditions.push(gte(schema.events.startTime, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(schema.events.startTime, filters.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ value: total }] = await db
      .select({ value: sql<number>`COUNT(*)::int` })
      .from(schema.events)
      .where(whereClause);

    // Get events
    const events = await db
      .select({
        id: schema.events.id,
        fingerprint: schema.events.fingerprint,
        sourceId: schema.events.sourceId,
        title: schema.events.title,
        description: schema.events.description,
        severity: schema.events.severity,
        type: schema.events.type,
        status: schema.events.status,
        startTime: schema.events.startTime,
        endTime: schema.events.endTime,
        district: schema.events.district,
        locationName: schema.events.locationName,
        latitude: schema.events.latitude,
        longitude: schema.events.longitude,
        originalUrl: schema.events.originalUrl,
        createdAt: schema.events.createdAt,
        updatedAt: schema.events.updatedAt,
      })
      .from(schema.events)
      .where(whereClause)
      .orderBy(desc(schema.events.startTime))
      .limit(limit)
      .offset(offset);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single event by ID with update history
   */
  async getEventById(id: string): Promise<EventDetail | null> {
    const db = getDb();

    const event = await db.query.events.findFirst({
      where: eq(schema.events.id, id),
      with: {
        updates: {
          orderBy: desc(schema.eventUpdates.detectedAt),
          limit: 50,
          columns: {
            id: true,
            changedFields: true,
            detectedAt: true,
          },
        },
      },
    });

    if (!event) {
      return null;
    }

    return {
      id: event.id,
      fingerprint: event.fingerprint,
      sourceId: event.sourceId,
      originalId: event.originalId,
      title: event.title,
      description: event.description,
      severity: event.severity,
      type: event.type,
      status: event.status,
      startTime: event.startTime,
      endTime: event.endTime,
      district: event.district,
      locationName: event.locationName,
      latitude: event.latitude,
      longitude: event.longitude,
      originalUrl: event.originalUrl,
      originalData: event.originalData as Record<string, unknown> | null,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      updates: event.updates ?? [],
    };
  }

  /**
   * Get events as GeoJSON for map display
   */
  async getEventsForMap(filters: {
    type?: string;
    severity?: string;
  }): Promise<{ type: 'FeatureCollection'; features: Array<any> }> {
    const db = getDb();
    const conditions: any[] = [
      // Only active events with location data
      eq(schema.events.status, 'active'),
      sql`${schema.events.latitude} IS NOT NULL`,
      sql`${schema.events.longitude} IS NOT NULL`,
    ];

    if (filters.type && isValidEventType(filters.type)) {
      conditions.push(eq(schema.events.type, filters.type));
    }

    if (filters.severity && isValidSeverity(filters.severity)) {
      conditions.push(eq(schema.events.severity, filters.severity));
    }

    const events = await db
      .select({
        id: schema.events.id,
        title: schema.events.title,
        description: schema.events.description,
        severity: schema.events.severity,
        type: schema.events.type,
        startTime: schema.events.startTime,
        latitude: schema.events.latitude,
        longitude: schema.events.longitude,
        district: schema.events.district,
        locationName: schema.events.locationName,
      })
      .from(schema.events)
      .where(and(...conditions))
      .orderBy(desc(schema.events.startTime))
      .limit(1000);

    const features = events.map((event) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(event.longitude || '0'), parseFloat(event.latitude || '0')],
      },
      properties: {
        id: event.id,
        title: event.title,
        description: event.description,
        severity: event.severity,
        type: event.type,
        startTime: event.startTime.toISOString(),
        district: event.district,
        locationName: event.locationName,
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  /**
   * Get update history for an event
   */
  async getEventUpdates(eventId: string, page = 1, limit = 20) {
    const db = getDb();
    const offset = (page - 1) * limit;

    const updates = await db
      .select({
        id: schema.eventUpdates.id,
        changedFields: schema.eventUpdates.changedFields,
        previousData: schema.eventUpdates.previousData,
        newData: schema.eventUpdates.newData,
        detectedAt: schema.eventUpdates.detectedAt,
        createdAt: schema.eventUpdates.createdAt,
      })
      .from(schema.eventUpdates)
      .where(eq(schema.eventUpdates.eventId, eventId))
      .orderBy(desc(schema.eventUpdates.detectedAt))
      .limit(limit)
      .offset(offset);

    return updates;
  }
}

export const eventService = new EventService();
