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

## 2026-02-13 (Database and Worker Fixes)

### CRITICAL

- [x] Fix Postgres migration JSONB default value error
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

## 2026-02-13 (Almaty Data Source Integration)

### CRITICAL

*No critical tasks.*

### HIGH

- [ ] **Step 1: Foundation (Backend)** - Mock data, Weather Adapter, Scheduler update, Seed script
  - [ ] Create mock data directory and files
    - [ ] Create backend/adapters/mocks/ directory
    - [ ] Create weather-mock.json (Open Meteo sample response)
    - [ ] Create air-quality-mock.json (air.org.kz sample response)
    - [ ] Create energy-mock.json (AZhK sample data)
    - [ ] Create mock-loader.ts utility
  - [ ] Implement Weather Adapter (Open Meteo)
    - [ ] Create backend/adapters/weather-adapter.ts
    - [ ] Implement SourceAdapter interface (fetch + normalize methods)
    - [ ] Map weather codes to severity levels
    - [ ] Test with real API endpoint
    - [ ] Test with mock data fallback
  - [ ] Update scheduler to support weather adapter
    - [ ] Modify backend/worker/scheduler.ts createAdapter() method
    - [ ] Add case for 'weather' or 'json' type
    - [ ] Test end-to-end ingestion
  - [ ] Create seed script for Almaty sources
    - [ ] Create backend/scripts/seed-almaty-sources.ts
    - [ ] Add source records for weather, air quality, energy
    - [ ] Run seed script to populate database
- [ ] **Step 2: Air Quality Integration (Backend)**
  - [ ] Review air.org.kz API documentation
    - [ ] Identify Almaty-specific endpoints
    - [ ] Test API manually (curl or browser)
    - [ ] Document data structure and authentication requirements
  - [ ] Implement Air Quality Adapter
    - [ ] Create backend/adapters/air-quality-adapter.ts
    - [ ] Implement SourceAdapter interface
    - [ ] Map AQI values to severity (0-50: low, 51-100: medium, 101-150: high, 151+: critical)
    - [ ] Extract station locations and district names
    - [ ] Test with real API
  - [ ] Update scheduler for air quality adapter
    - [ ] Add case in createAdapter()
    - [ ] Test end-to-end ingestion
- [ ] **Step 3: Energy Outage Integration (Backend)**
  - [ ] Analyze AZhK HTML structure
    - [ ] Fetch sample HTML from https://www.azhk.kz/ru/spetsialnye-razdely/all-graphics
    - [ ] Document table structure and CSS selectors
    - [ ] Identify date formats and address patterns
  - [ ] Implement Energy Adapter
    - [ ] Create backend/adapters/energy-adapter.ts
    - [ ] Implement Cheerio-based HTML table parsing
    - [ ] Implement Russian date parsing (date-fns with ru locale)
    - [ ] Extract addresses and store in locationName
    - [ ] Generate separate events for each outage window
    - [ ] Implement status logic (active for future, resolved for past)
  - [ ] Update scheduler for energy adapter
    - [ ] Add case in createAdapter() for 'html' type
  - [ ] Extensive testing
    - [ ] Test with real HTML
    - [ ] Test with mock data
    - [ ] Verify date parsing edge cases
    - [ ] Check event deduplication

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

