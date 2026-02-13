# TODO

**Project State Tracking - Tasks**

---

## 2025-02-12

### CRITICAL

*No critical tasks.*

### HIGH

*No high priority tasks.*

### MEDIUM

- [x] Initialize state tracking system
- [x] Update utility scripts for state file integration

### LOW

*No low priority tasks.*

---

## 2026-02-13

### CRITICAL

*No critical tasks.*

### HIGH

- [x] Implement core API endpoints with filtering and pagination
- [ ] Implement RSS/Atom source adapter for ingestion
- [ ] Setup Telegram bot with webhook and basic commands

### MEDIUM

- [x] Add frontend design system rules to claude.md
- [x] Create frontend-design-guidelines.md with design tokens and standards
- [x] Complete Phase 1: Foundation
  - [x] Create backend directory structure
  - [x] Setup Drizzle ORM schema
  - [x] Create database migration scripts
  - [x] Implement Hono API server with health check
  - [x] Update Docker Compose with all services
  - [x] Create Dockerfiles for API and Worker
  - [x] Test API server responds to requests
- [x] Complete Phase 2: Core API
  - [x] Implement GET /api/v1/events with filtering (type, severity, date range, district)
  - [x] Implement GET /api/v1/events/:id with update history
  - [x] Add Zod validation for all API inputs
  - [x] Implement error handling middleware
  - [x] Add Redis caching for feed endpoint
  - [x] Create seed data script for testing
  - [x] Write API tests with Bun test
- [x] Complete Phase 3: Ingestion System
  - [x] Implement RSS/Atom source adapter
  - [x] Create source polling scheduler in worker
  - [x] Implement fingerprint computation
  - [x] Implement upsert logic with change detection
  - [x] Create event_update records on changes
  - [x] Add ingestion logging
  - [ ] Connect to one real source (requires valid source URL)
  - [x] Test deduplication
- [x] Complete Phase 4: Telegram Integration
  - [x] Setup grammY bot with webhook endpoint
  - [x] Implement /start, /help, /subscribe, /unsubscribe commands
  - [x] Create subscription table and queries
  - [x] Implement BullMQ job queue
  - [x] Create telegram-worker process
  - [x] Implement delivery logic with formatting
  - [x] Test end-to-end: event → subscribed user receives message
  - [x] Add retry logic and dead letter queue

### LOW

*No low priority tasks.*

---

## 2026-02-13 (Continued)

### CRITICAL

*No critical tasks.*

### HIGH

- [x] Complete Phase 5: Frontend
  - [x] Project setup and configuration (dependencies, design tokens)
  - [x] Core components (shadcn/ui + customization)
  - [x] API client layer
  - [x] Language support (EN, RU, KK)
  - [x] Feed page with filtering and pagination
  - [x] Event detail page with update timeline
  - [x] Map view page with MapLibre GL JS
  - [x] Admin interface for source management (placeholder, backend API pending)
  - [x] Shared layout components (header, footer)
- [x] Fix backend API startup errors
  - [x] Install missing dependencies (@grammyjs/auto-retry, class-variance-authority)
  - [x] Fix duplicate method definition in bot.service.ts
  - [x] Implement lazy bot service initialization
- [x] Fix frontend compilation errors
  - [x] Fix import paths for LANGUAGES in header.tsx
- [x] Configure docker-compose for automatic migrations
  - [x] Run docker compose with all services
  - [x] Verify services start correctly and migrations run automatically
- [x] Fix backend API startup errors
  - [x] Install missing dependencies (@grammyjs/auto-retry, class-variance-authority)
  - [x] Fix duplicate method definition in bot.service.ts
  - [x] Implement lazy bot service initialization
- [x] Fix frontend compilation errors
  - [x] Fix import paths for LANGUAGES in header.tsx

### MEDIUM

*No medium priority tasks.*

### LOW

*No low priority tasks.*

- [x] Remove deprecated version field from docker-compose.yml
- [x] Fix TypeScript error in backend/adapters/rss-adapter.ts (cheerio callable issue)
- [x] Install @types/bun and configure tsconfig.json for Bun types
- [x] Fix TypeScript error in error handler with type guard (backend/api/index.ts)
- [x] Fix Drizzle enum type mismatch in event.service.ts with type guards
- [x] Fix Drizzle db typing to enable db.query.events (backend/lib/db.ts)
- [x] Fix TypeScript error in seed.ts (severity/type/status enum type mismatch)
- [x] Fix TypeScript error in test-deduplication.ts (missing eq import)
- [x] Fix Docker compose build errors (TypeScript type mismatches in hasMeaningfulChange)
- [x] Configure tsconfig.json to exclude backend folder from Next.js type-checking
- [x] Remove unnecessary build steps from backend Dockerfiles
- [x] Create .dockerignore file for optimized Docker builds
- [x] Fix import error in telegram-worker (telegramBotService -> TelegramBotService)
- [x] Add missing eq import in worker/scheduler.ts
- [x] Fix API port conflict in docker-compose.yml (map to host port 3001)
- [x] Fix Bun double-serve issue (remove export default app)
- [x] Create database migration entrypoint script
- [x] Update Dockerfiles to run migrations automatically on startup

---

## 2026-02-13 (Continued - Almaty Integration Complete)

### CRITICAL

*No critical tasks.*

### HIGH

- [x] Fix air quality adapter API response parsing
  - [x] Updated TypeScript interfaces for air.org.kz response format
  - [x] Added support for `_avg` suffix field names
  - [x] Added wrapper for `districts` array structure
- [x] Create frontend map API route proxy
  - [x] Created `app/api/v1/map/events/route.ts`
  - [x] Forward query params to backend
  - [x] Added caching and error handling
- [ ] **Step 4: Frontend Integration** (Remaining tasks)
  - [x] Map component working with 2GIS SDK
  - [ ] Create specialized event widgets
    - [ ] Create components/event/weather-widget.tsx (multi-day forecast, temperature chart)
    - [ ] Create components/event/aqi-indicator.tsx (circular gauge, color-coded health warnings)
    - [ ] Create components/event/outage-schedule.tsx (timeline display, affected addresses)
    - [ ] Follow control room aesthetic from frontend-design-guidelines.md
  - [ ] Update event card component
    - [ ] Modify components/event/event-card.tsx
    - [ ] Add conditional rendering for new event types
    - [ ] Import and use specialized widgets
  - [ ] Update filter bar
    - [ ] Modify components/event/filter-bar.tsx
    - [ ] Add icons for new event types (Cloud, Wind, Zap from Lucide)
    - [ ] Test filter functionality
  - [ ] Test responsive design
    - [ ] Test on mobile (375px)
    - [ ] Test on tablet (768px)
    - [ ] Test on desktop (1280px+)
    - [ ] Check accessibility (ARIA labels, keyboard navigation)

### MEDIUM

- [ ] **Step 5: Testing & Refinement**
  - [x] End-to-end testing
    - [x] Verify all adapters polling correctly
    - [x] Check event creation and deduplication
    - [ ] Test frontend display for all event types
    - [ ] Verify filters work correctly
  - [ ] Mock fallback testing
    - [ ] Test mock data loading when APIs fail
    - [ ] Verify auto-disable after 10 consecutive failures
  - [ ] Performance validation
    - [ ] Check database query performance
    - [ ] Monitor Redis cache hit rates
    - [ ] Verify polling intervals don't overlap
  - [ ] Documentation updates
    - [ ] Update README with new data sources
    - [ ] Document environment variables (.env)
    - [ ] Add examples for adding new sources

### LOW

- [x] Add environment variables to .env
  - [x] ALMATY_LAT=43.2220 (added to seed script)
  - [x] ALMATY_LNG=76.8512 (added to seed script)
  - [x] ENABLE_MOCK_FALLBACK=true (mock loader checks env)
- [ ] Update frontend-design-guidelines.md when adding new UI components
- [ ] Consider adding database indexes if performance testing shows need
  - [ ] idx_events_type_district_start
  - [ ] idx_events_severity_status

---

## 2026-02-13 (Database and Worker Fixes)

### CRITICAL

- [x] Fix Postgres migration JSONB default value error
- [x] Fix Telegram worker PostgreSQL operator error
  - [x] Fix eventTypesFilter JSONB @> operator: ARRAY['*']::text → '["*"]'::jsonb
  - [x] Fix districtFilter TEXT UNNEST() error: remove UNNEST, use simple text comparison
  - [x] Change ARRAY['*']::JSONB to '["*"]'::jsonb in migrations/001_initial.sql
- [x] Add migration locking to prevent concurrent migrations
  - [x] Implement Postgres advisory locks in migrate.ts
  - [x] Add table existence check to skip redundant migrations
- [x] Ensure workers start only after migrations complete
  - [x] Add waitForTables() function to db.ts
  - [x] Update all workers to wait for tables before initialization
- [x] Fix workers to exit non-zero on startup errors
  - [x] Update worker/index.ts error handling
  - [x] Update telegram-worker/index.ts error handling
  - [x] Update api/index.ts error handling
- [x] Add healthcheck endpoints to workers
  - [x] Create healthcheck.ts utility with HTTP server
  - [x] Add healthcheck to ingestion worker
  - [x] Add healthcheck to telegram worker
- [x] Update Docker Compose for proper startup ordering
  - [x] Add healthcheck to API service
  - [x] Add healthchecks to worker services
  - [x] Make workers depend on API being healthy
  - [x] Add restart policies to all services
  - [x] Install curl in all Dockerfiles for healthchecks

### HIGH

*No high priority tasks.*

### MEDIUM

*No medium priority tasks.*

### LOW

*No low priority tasks.*


## 2026-02-13

- [x] Fix TypeScript type errors in map-view.tsx
- [x] Fix missing Translations import in i18n types
- [x] Exclude scripts from TypeScript compilation
- [x] Fix Suspense boundary issue in feed page
- [x] Successfully build all Docker containers
- [x] Fix frontend Docker healthcheck failure (Next.js binding to container hostname instead of 0.0.0.0)

---

## 2026-02-13 (Darker Map UI Theme)

### CRITICAL

*No critical tasks.*

### HIGH

- [x] Implement darker color scheme for map page UI elements
- [x] Update buttons to use darker background (#131825)
- [x] Update filter panels to use darker background (#131825)
- [x] Update Select component with dark theme colors
- [x] Update frontend-design-guidelines.md with version history

### MEDIUM

*No medium priority tasks.*

### LOW

*No low priority tasks.*

---

## 2026-02-13 (Almaty Data Source Integration)

### CRITICAL

*No critical tasks.*

### HIGH

- [x] **Step 1: Foundation (Backend)** - Mock data, Weather Adapter, Scheduler update, Seed script
  - [x] Create mock data directory and files
    - [x] Create backend/adapters/mocks/ directory
    - [x] Create weather-mock.json (Open Meteo sample response)
    - [x] Create air-quality-mock.json (air.org.kz sample response)
    - [x] Create energy-mock.json (AZhK sample data)
    - [x] Create mock-loader.ts utility
  - [x] Implement Weather Adapter (Open Meteo)
    - [x] Create backend/adapters/weather-adapter.ts
    - [x] Implement SourceAdapter interface (fetch + normalize methods)
    - [x] Map weather codes to severity levels
    - [x] Test with real API endpoint
    - [x] Test with mock data fallback
  - [x] Update scheduler to support weather adapter
    - [x] Modify backend/worker/scheduler.ts createAdapter() method
    - [x] Add case for 'weather' or 'json' type
    - [x] Test end-to-end ingestion
  - [x] Create seed script for Almaty sources
    - [x] Create backend/scripts/seed-almaty-sources.ts
    - [x] Add source records for weather, air quality, energy
    - [x] Run seed script to populate database
- [x] **Step 2: Air Quality Integration (Backend)**
  - [x] Review air.org.kz API documentation
    - [x] Identify Almaty-specific endpoints
    - [x] Test API manually (curl or browser)
    - [x] Document data structure and authentication requirements
  - [x] Implement Air Quality Adapter
    - [x] Create backend/adapters/air-quality-adapter.ts
    - [x] Implement SourceAdapter interface
    - [x] Map AQI values to severity (0-50: low, 51-100: medium, 101-150: high, 151+: critical)
    - [x] Extract station locations and district names
    - [x] Test with real API
  - [x] Update scheduler for air quality adapter
    - [x] Add case in createAdapter()
    - [x] Test end-to-end ingestion
- [x] **Step 3: Energy Outage Integration (Backend)**
  - [x] Analyze AZhK HTML structure
    - [x] Fetch sample HTML from https://www.azhk.kz/ru/spetsialnye-razdely/all-graphics
    - [x] Document table structure and CSS selectors
    - [x] Identify date formats and address patterns
  - [x] Implement Energy Adapter
    - [x] Create backend/adapters/energy-adapter.ts
    - [x] Implement Cheerio-based HTML table parsing
    - [x] Implement Russian date parsing (date-fns with ru locale)
    - [x] Extract addresses and store in locationName
    - [x] Generate separate events for each outage window
    - [x] Implement status logic (active for future, resolved for past)
  - [x] Update scheduler for energy adapter
    - [x] Add case in createAdapter() for 'html' type
  - [ ] Extensive testing
    - [x] Test with real HTML
    - [x] Test with mock data
    - [ ] Verify date parsing edge cases
    - [x] Check event deduplication

### MEDIUM

- [ ] **Step 4: Frontend Integration**
  - [ ] Create specialized event widgets
    - [ ] Create components/event/weather-widget.tsx (multi-day forecast, temperature chart)
    - [ ] Create components/event/aqi-indicator.tsx (circular gauge, color-coded health warnings)
    - [ ] Create components/event/outage-schedule.tsx (timeline display, affected addresses)
    - [ ] Follow control room aesthetic from frontend-design-guidelines.md
  - [ ] Update event card component
    - [ ] Modify components/event/event-card.tsx
    - [ ] Add conditional rendering for new event types
    - [ ] Import and use specialized widgets
  - [ ] Update filter bar
    - [ ] Modify components/event/filter-bar.tsx
    - [ ] Add icons for new event types (Cloud, Wind, Zap from Lucide)
    - [ ] Test filter functionality
  - [ ] Test responsive design
    - [ ] Test on mobile (375px)
    - [ ] Test on tablet (768px)
    - [ ] Test on desktop (1280px+)
    - [ ] Check accessibility (ARIA labels, keyboard navigation)
- [ ] **Step 5: Testing & Refinement**
  - [ ] End-to-end testing
    - [ ] Verify all adapters polling correctly
    - [ ] Check event creation and deduplication
    - [ ] Test frontend display for all event types
    - [ ] Verify filters work correctly
  - [ ] Mock fallback testing
    - [ ] Test mock data loading when APIs fail
    - [ ] Verify auto-disable after 10 consecutive failures
  - [ ] Performance validation
    - [ ] Check database query performance
    - [ ] Monitor Redis cache hit rates
    - [ ] Verify polling intervals don't overlap
  - [ ] Documentation updates
    - [ ] Update README with new data sources
    - [ ] Document environment variables (.env)
    - [ ] Add examples for adding new sources

### LOW

- [ ] Add environment variables to .env
  - [ ] ALMATY_LAT=43.2220
  - [ ] ALMATY_LNG=76.8512
  - [ ] ENABLE_MOCK_FALLBACK=true
  - [ ] TWOGIS_API_KEY=your_key_here (placeholder for Phase 2)
- [ ] Update frontend-design-guidelines.md when adding new UI components
- [ ] Consider adding database indexes if performance testing shows need
  - [ ] idx_events_type_district_start
  - [ ] idx_events_severity_status

---

## 2026-02-13 (Map Fix - 2GIS to MapLibre GL Migration)

### CRITICAL

*No critical tasks.*

### HIGH

- [x] Replace 2GIS Map SDK with MapLibre GL + OSM tiles
  - [x] Updated components/map/map-view.tsx to use maplibre-gl
  - [x] Removed API key dependency - uses free OSM raster tiles
  - [x] Implemented severity-based marker icons
  - [x] Added map popup with event details
- [x] Integrate map into feed page with view toggle
  - [x] Added ViewMode state ('list' | 'map') to app/feed/page.tsx
  - [x] Created toggle buttons with List/Map icons
  - [x] Embedded map in 600px container when map view selected
- [ ] Test map and feed page integration

### MEDIUM

*No medium priority tasks.*

### LOW

- [x] **Step 6: Add Kazakhstan Cities** (Research Complete)
  - [x] Research data sources for Astana, Kyzylorda, Shymkent
  - [x] Create universal seed script for all cities
  - [x] Create seed-astana-sources.ts
  - [x] Create seed-shymkent-sources.ts
  - [x] Create seed-kyzylorda-sources.ts
  - [x] Document available data sources for all cities
  - [ ] Test weather data ingestion for all cities
  - [ ] Implement electricity adapters for Astana/Shymkent/Kyzylorda
    - [ ] Research "Энергосистема" HTML structure for planned shutdowns
    - [ ] Create adapter for arek.kz (Astana)
    - [ ] Test and validate electricity data parsing
  - [ ] Update frontend city filter/component

---

## 2026-02-13 (Data Sources Research Summary)

### Available Data Sources by City

| City | Weather | Air Quality | Electricity |
|------|---------|-------------|--------------|
| Almaty | ✅ Open Meteo | ✅ air.org.kz | ✅ AZhK (azhk.kz) |
| Astana | ✅ Open Meteo | ❌ Not available | ⚠️ arek.kz, energosystema.kz |
| Shymkent | ✅ Open Meteo | ❌ Not available | ⚠️ energosystema.kz |
| Kyzylorda | ✅ Open Meteo | ❌ Not available | ⚠️ energosystema.kz |

### Key Findings:
- **Weather**: Open Meteo API works for ANY city with coordinates
- **Air Quality**: air.org.kz appears Almaty-only (no API for other cities)
- **Electricity**: Different energy companies serve different regions
  - "Энергосистема" (energosystema.kz/plannedShutdown) covers multiple cities
  - Each city may have its own local utility company website


## 2026-02-13 (Map Tile Loading Fix)

### CRITICAL

- [x] Fix MapLibre GL map tile loading (NS_BINDING_ABORTED error)
  - [x] Removed circular dependency in useEffect
  - [x] Added map initialization guards
  - [x] Prevented duplicate map initialization

### HIGH

- [x] Replace MapLibre GL with Leaflet for better reliability
  - [x] Installed leaflet and @types/leaflet
  - [x] Rewrote map component to use Leaflet
  - [x] Changed tile provider to CartoDB Voyager (free, reliable)
  - [x] Removed maplibre-gl dependency

- [x] Fix Leaflet SSR error (window is not defined)
  - [x] Added dynamic import with ssr: false
  - [x] Updated feed page to use dynamic import
  - [x] Updated map page to use dynamic import

## 2026-02-13 (District Filter Improvement)

- [x] Replace district text input with dropdown select
  - [x] Add district translations for en, ru, kk
  - [x] Update FilterBar component with Select
  - [x] Remove unused Input import

---

## 2026-02-13 (Almaty Test Events - Map Markers)

- [x] Create seed script for Almaty test events with landmarks
  - [x] Create backend/scripts/seed-almaty-test-events.ts with 10 landmark events
  - [x] Add real coordinates for popular Almaty locations
- [x] Run seed script to add test events to database
  - [x] Fix PostgreSQL password authentication issue
  - [x] Execute seed script inside Docker container
  - [x] Verify 10 events created successfully
