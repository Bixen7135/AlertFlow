import { pgTable, text, timestamp, integer, boolean, jsonb, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const severityEnum = pgEnum('severity', ['low', 'medium', 'high', 'critical']);
export const eventTypeEnum = pgEnum('event_type', ['weather', 'traffic', 'public_safety', 'health', 'utility', 'other']);
export const eventStatusEnum = pgEnum('event_status', ['active', 'updated', 'resolved', 'cancelled']);
export const sourceTypeEnum = pgEnum('source_type', ['rss', 'json', 'html']);
export const ingestionStatusEnum = pgEnum('ingestion_status', ['success', 'partial', 'error']);

// Sources table - Configuration for each external alert source
export const sources = pgTable('sources', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  type: sourceTypeEnum('type').notNull(),
  url: text('url').notNull(),
  pollingIntervalSeconds: integer('polling_interval_seconds').notNull().default(300),
  enabled: boolean('enabled').notNull().default(true),
  lastPollAt: timestamp('last_poll_at'),
  lastSuccessAt: timestamp('last_success_at'),
  failureCount: integer('failure_count').notNull().default(0),
  config: jsonb('config').$type<Record<string, unknown>>().default({}), // For source-specific config
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  enabledIdx: index('idx_sources_enabled').on(table.enabled),
}));

// Events table - Unified event storage
export const events = pgTable('events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  fingerprint: text('fingerprint').notNull().unique(),
  sourceId: text('source_id').notNull().references(() => sources.id, { onDelete: 'cascade' }),
  originalId: text('original_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  severity: severityEnum('severity').notNull(),
  type: eventTypeEnum('type').notNull(),
  status: eventStatusEnum('status').notNull().default('active'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  district: text('district'),
  locationName: text('location_name'),
  latitude: text('latitude'), // Stored as text to handle precision issues
  longitude: text('longitude'),
  originalUrl: text('original_url'),
  originalData: jsonb('original_data').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  fingerprintUniqueIdx: unique('idx_events_fingerprint').on(table.fingerprint),
  typeStatusIdx: index('idx_events_type_status').on(table.type, table.status),
  createdAtIdx: index('idx_events_created_at').on(table.createdAt),
  startTimeIdx: index('idx_events_start_time').on(table.startTime),
  sourceIdIdx: index('idx_events_source_id').on(table.sourceId),
}));

// Event Updates table - Track changes to events over time
export const eventUpdates = pgTable('event_updates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  changedFields: jsonb('changed_fields').$type<string[]>().notNull(),
  previousData: jsonb('previous_data').$type<Record<string, unknown>>(),
  newData: jsonb('new_data').$type<Record<string, unknown>>(),
  detectedAt: timestamp('detected_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  eventIdIdx: index('idx_event_updates_event_id').on(table.eventId),
  detectedAtIdx: index('idx_event_updates_detected_at').on(table.detectedAt),
}));

// Telegram Subscriptions table
export const telegramSubscriptions = pgTable('telegram_subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  telegramUserId: text('telegram_user_id').notNull(),
  telegramChatId: text('telegram_chat_id').notNull(),
  eventTypesFilter: jsonb('event_types_filter').$type<string[]>().default(['*']), // '*' means all types
  districtFilter: text('district_filter').default('*'), // '*' means all districts
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_telegram_subscriptions_user').on(table.telegramUserId),
  userIdChatIdUniqueIdx: unique('idx_telegram_subscriptions_user_chat').on(table.telegramUserId, table.telegramChatId),
}));

// Ingestion Logs table - Track source polling activity
export const ingestionLogs = pgTable('ingestion_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sourceId: text('source_id').notNull().references(() => sources.id, { onDelete: 'cascade' }),
  status: ingestionStatusEnum('status').notNull(),
  message: text('message'),
  eventsFound: integer('events_found').notNull().default(0),
  eventsCreated: integer('events_created').notNull().default(0),
  eventsUpdated: integer('events_updated').notNull().default(0),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  sourceIdIdx: index('idx_ingestion_logs_source_id').on(table.sourceId),
  statusIdx: index('idx_ingestion_logs_status').on(table.status),
  startedAtIdx: index('idx_ingestion_logs_started_at').on(table.startedAt),
}));

// Relations
export const sourcesRelations = relations(sources, ({ many }) => ({
  events: many(events),
  ingestionLogs: many(ingestionLogs),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  source: one(sources, {
    fields: [events.sourceId],
    references: [sources.id],
  }),
  updates: many(eventUpdates),
}));

export const eventUpdatesRelations = relations(eventUpdates, ({ one }) => ({
  event: one(events, {
    fields: [eventUpdates.eventId],
    references: [events.id],
  }),
}));

// Type exports
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventUpdate = typeof eventUpdates.$inferSelect;
export type NewEventUpdate = typeof eventUpdates.$inferInsert;
export type TelegramSubscription = typeof telegramSubscriptions.$inferSelect;
export type NewTelegramSubscription = typeof telegramSubscriptions.$inferInsert;
export type IngestionLog = typeof ingestionLogs.$inferSelect;
export type NewIngestionLog = typeof ingestionLogs.$inferInsert;
