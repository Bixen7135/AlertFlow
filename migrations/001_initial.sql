-- AlertFlow Initial Schema
-- This creates all tables, enums, and indexes for the MVP

-- Create custom types (enums)
CREATE TYPE severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE event_type AS ENUM ('weather', 'traffic', 'public_safety', 'health', 'utility', 'other');
CREATE TYPE event_status AS ENUM ('active', 'updated', 'resolved', 'cancelled');
CREATE TYPE source_type AS ENUM ('rss', 'json', 'html');
CREATE TYPE ingestion_status AS ENUM ('success', 'partial', 'error');

-- Sources table
CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type source_type NOT NULL,
  url TEXT NOT NULL,
  polling_interval_seconds INTEGER NOT NULL DEFAULT 300,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_poll_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  failure_count INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sources_enabled ON sources(enabled);

-- Events table
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  original_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity severity NOT NULL,
  type event_type NOT NULL,
  status event_status NOT NULL DEFAULT 'active',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  district TEXT,
  location_name TEXT,
  latitude TEXT,
  longitude TEXT,
  original_url TEXT,
  original_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT events_fingerprint_unique UNIQUE (fingerprint)
);

CREATE INDEX idx_events_type_status ON events(type, status);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_start_time ON events(start_time DESC);
CREATE INDEX idx_events_source_id ON events(source_id);
CREATE UNIQUE INDEX idx_events_fingerprint ON events(fingerprint);

-- Event Updates table
CREATE TABLE event_updates (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  changed_fields JSONB NOT NULL,
  previous_data JSONB,
  new_data JSONB,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_updates_event_id ON event_updates(event_id);
CREATE INDEX idx_event_updates_detected_at ON event_updates(detected_at);

-- Telegram Subscriptions table
CREATE TABLE telegram_subscriptions (
  id TEXT PRIMARY KEY,
  telegram_user_id TEXT NOT NULL,
  telegram_chat_id TEXT NOT NULL,
  event_types_filter JSONB DEFAULT '["*"]'::jsonb,
  district_filter TEXT DEFAULT '*',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT telegram_subscriptions_user_chat_unique UNIQUE (telegram_user_id, telegram_chat_id)
);

CREATE INDEX idx_telegram_subscriptions_user ON telegram_subscriptions(telegram_user_id);
CREATE UNIQUE INDEX idx_telegram_subscriptions_user_chat ON telegram_subscriptions(telegram_user_id, telegram_chat_id);

-- Ingestion Logs table
CREATE TABLE ingestion_logs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  status ingestion_status NOT NULL,
  message TEXT,
  events_found INTEGER NOT NULL DEFAULT 0,
  events_created INTEGER NOT NULL DEFAULT 0,
  events_updated INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_ingestion_logs_source_id ON ingestion_logs(source_id);
CREATE INDEX idx_ingestion_logs_status ON ingestion_logs(status);
CREATE INDEX idx_ingestion_logs_started_at ON ingestion_logs(started_at);
