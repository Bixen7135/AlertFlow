# DECISIONS

**Project State Tracking - Architectural & Structural Decisions**

---

## 2025-02-12

---

**17:30:00** INITIALIZATION - Established state tracking system with TODO.md, PROGRESS.md, DECISIONS.md, and ISSUES.md for project memory.

**17:32:00** CHOICE - Selected append-only approach for state files to preserve complete history. Never rewriting or removing entries.

**17:34:00** ARCHITECTURE - Integrated state file reading into existing utility scripts (todo.ts, progress.ts) rather than creating separate state management tools.

**17:37:00** PATTERN - Established that all code modifications must: (1) Ensure task exists in TODO.md first, (2) Log change in PROGRESS.md after, (3) Log blockers to ISSUES.md, (4) Log architectural decisions to DECISIONS.md.

---

## 2026-02-13

---

**14:00:00** ARCHITECTURE - Established frontend-design-guidelines.md as the single source of truth for all frontend development. All visual, stylistic, and component-level changes must update this file before or together with implementation.

**14:00:00** STANDARD - Defined design token system using CSS custom properties with semantic naming (--color-primary, --text-body-lg, --space-4, etc.) for consistency and maintainability.

**14:00:00** REQUIREMENT - Mandated WCAG 2.1 Level AA compliance for all frontend implementations including color contrast ratios (4.5:1 for normal text, 3:1 for large text), keyboard navigation, and screen reader support.

**14:00:00** WORKFLOW - Established that frontend-development skill must be used for all UI/component creation, with strict adherence to guidelines to prevent divergence between implementation and design specification.

**14:15:00** PALETTE - Adopted new color scheme with blue-based brand identity (#123E6B primary, #0B2A55 navy), teal accent (#3FB7A7), green for success (#1F6B4F), amber warning (#F4A300), and red critical (#D93A3A).

**14:15:00** CONSTRAINT - Reserved warning and critical colors exclusively for actual alerts; prohibited decorative use to maintain visual hierarchy and user attention management.

**15:00:00** ARCHITECTURE - Established modular monolith with separated runtime roles (API and Worker) sharing a single codebase. PostgreSQL as single source of truth, Redis for ephemeral cache and queue only.

**15:05:00** TACH STACK - Selected Bun as package manager and runtime (matching existing bun.lock), Node.js compatibility for backend, Next.js 16 for frontend (existing), PostgreSQL 16 and Redis 7 via Docker Compose.

**15:10:00** API FRAMEWORK - Chose Hono over Express/NestJS for: TypeScript-native, Bun-optimized performance, lightweight footprint, faster startup times. Hono's modern async patterns align with Bun's runtime.

**15:15:00** ORM - Selected Drizzle ORM over Prisma for: Bun compatibility without TypeScript compile step, better performance, SQL-first approach, smaller bundle size. Drizzle's schema-as-code approach provides type safety without runtime overhead.

**15:20:00** VALIDATION - Chose Zod for type-safe validation. Integrates seamlessly with Hono (@hono/zod-validator) and Drizzle, ensuring end-to-end type safety from API request to database query.

**15:25:00** JOB QUEUE - Selected BullMQ over alternatives for: Production reliability, native Redis 7 support, built-in retry policies with exponential backoff, dead letter queue support, TypeScript-first design.

**15:30:00** TELEGRAM - Selected grammY over telegraf for: Modern TypeScript-first API, built-in session handling, better TypeScript support, active maintenance, more intuitive API design.

**15:35:00** HTTP CLIENT - Chose ofetch over node-fetch/axios for: Bun-native fetch wrapper, built-in retry logic, lighter weight, better Bun runtime integration.

**15:40:00** MAP LIBRARY - Selected MapLibre GL JS over Mapbox/Google Maps for: Free, no API key required (OpenStreetMap tiles), open source, GL JS performance, self-hosted tile capability.

**15:45:00** PORT ALLOCATION - Assigned port 3001 to API server to avoid conflict with Next.js frontend on port 3000. This separation allows concurrent development and independent deployment.

**15:50:00** TELEGRAM BOT - Selected grammY over telegraf for: Modern TypeScript-first API, built-in session handling, better TypeScript support, active maintenance, more intuitive API design. grammY's context objects and middleware system make handling updates cleaner than callback-based approaches.

**15:55:00** WEBHOOK INTEGRATION - Chose webhook over long-polling for Telegram updates: Real-time delivery, lower server load, simpler infrastructure. Webhook requires public endpoint but eliminates polling overhead.

**15:60:00** MESSAGE FORMATTING - Built message formatting in-code with emoji icons for severity levels and event types. Using native Unicode emojis instead of images reduces API calls and improves compatibility.

**15:65:00** SUBSCRIPTION MODEL - Implemented flexible filter matching: Array-based event type filter supports ['*'] wildcard and specific types. District filter supports '*' wildcard or exact match to allow granular or broad subscriptions.

**15:70:00** DELIVERY WORKER - Separate telegram-worker process for independent scaling. Queue-based delivery with BullMQ allows retry logic, rate limiting, and dead letter queue handling without blocking ingestion or API processes.

**23:15:00** BUILD OPTIMIZATION - Removed `bun run build` (Next.js build) from backend Dockerfiles. Backend services use Bun's native TypeScript execution without compilation. This eliminates Next.js type-checking of backend code, reduces build time, and prevents type conflicts between frontend and backend code.

**23:15:00** TYPE SEPARATION - Configured tsconfig.json to exclude backend/, docker/, and migrations/ folders from Next.js type-checking. This allows backend code to use database-native types (e.g., `string | null`) without conflicting with frontend conventions (e.g., `string | undefined`).

**23:15:00** NULLABLE TYPES - Updated hasMeaningfulChange() to accept `string | null | undefined` for latitude/longitude fields. Database returns null for nullable columns, but TypeScript code uses undefined. Function now normalizes null to undefined for consistent comparison logic.

**23:45:00** AUTOMATIC MIGRATIONS - Added entrypoint script to all Docker services that runs database migrations before starting the main process. This ensures the database schema is always up-to-date and eliminates the need for manual migration steps. Script retries until migrations succeed, handling database startup delays gracefully.

**23:45:00** BUN SERVE FIX - Removed `export default app` from API server to prevent Bun from auto-serving the exported app. When using `bun run`, explicitly calling `serve()` is sufficient. Exporting the app caused Bun to attempt a second server bind on the same port, resulting in EADDRINUSE errors.

## 2026-02-13 - Migration Coordination and Service Health Strategy

**Decision:** Use Postgres advisory locks for migration coordination

**Rationale:**
- Multiple containers (api, worker, telegram-worker) all run migrations via entrypoint.sh
- Without coordination, concurrent migrations can fail or cause race conditions
- Postgres advisory locks provide distributed locking without external dependencies
- Non-blocking try followed by blocking lock ensures one migrator runs while others wait
- Lock automatically released on connection close (no deadlock risk)

**Alternatives Considered:**
- External coordinator service: adds complexity, single point of failure
- File-based locking: doesn't work across containers
- Skip migrations in workers: requires manual ordering, fragile

**Decision:** Workers depend on API healthcheck instead of just postgres healthcheck

**Rationale:**
- API runs migrations via entrypoint.sh, but docker healthcheck only verifies postgres connectivity
- Workers starting before migrations complete would fail when accessing non-existent tables
- Making workers depend on api:healthy ensures migrations complete before workers start
- Provides proper startup ordering without additional coordinator service
- API healthcheck includes database connectivity check, validating full readiness

**Alternative Considered:**
- All services run migrations independently: inefficient, requires complex locking, slower startup
- Separate migration container with depends_on: adds complexity, requires custom coordination

**Decision:** Use embedded HTTP healthcheck server for workers

**Rationale:**
- Workers are long-running background processes without HTTP interface
- Docker healthchecks require HTTP endpoint or executable command
- Embedded server on /health endpoint is standard Docker pattern
- Allows workers to report initialization status (healthy only after full startup)
- Minimal overhead (simple HTTP server on dedicated port)
- Enables Docker to restart unhealthy workers automatically

**Alternative Considered:**
- Process-based healthcheck (check if process running): doesn't verify worker is functional
- File-based healthcheck: requires shared volume, less standard

**Decision:** Workers exit with code 1 on startup errors

**Rationale:**
- Docker restart policy (unless-stopped) only triggers on non-zero exit codes
- Silent failures (exit 0) would leave system in degraded state
- Proper exit codes enable Docker to automatically retry failed workers
- Critical for production resilience and automated recovery
- Allows operators to detect persistent failures via container restart loops

---

## 2026-02-13 - Next.js Hostname Binding in Docker

**Decision:** Set HOSTNAME=0.0.0.0 environment variable for Next.js standalone server in Docker

**Rationale:**
- Next.js standalone server (generated by output: 'standalone') binds to hostname from environment by default
- In Docker containers, hostname is the container ID (e.g., bd0cc5bd55d3), not localhost
- Binding to container hostname makes server inaccessible to container's localhost interface
- Healthcheck using curl http://localhost:3000 fails because localhost doesn't map to the server
- Setting HOSTNAME=0.0.0.0 forces Next.js to listen on all network interfaces
- Makes server accessible via localhost, container IP, and external port mapping
- Standard practice for containerized web servers (listen on 0.0.0.0, not specific hostname)

**Alternative Considered:**
- Change healthcheck to use container hostname: fragile, hostname changes between builds
- Use host networking mode: breaks container isolation, not recommended for production
- Bind to specific container IP: IP not known at build time, adds complexity


---

## 2026-02-13 - Control Room Aesthetic Design Direction

**Context:** Frontend needed a distinctive, memorable visual identity that avoided generic "AI slop" aesthetics and reflected the serious, technical nature of a real-time alert monitoring system.

**Decision:** Adopted a **Control Room / Emergency Operations Center** aesthetic inspired by NASA mission control, emergency dispatch centers, and technical monitoring interfaces.

**Rationale:**
1. **Context-appropriate:** AlertFlow monitors critical real-time events (emergencies, public safety, disasters) - a control room aesthetic reinforces the serious, professional nature of the application
2. **Distinctive:** Dark theme with neon glows and geometric fonts stands out from typical corporate web applications
3. **Functional:** High contrast colors and glowing severity indicators improve information hierarchy and critical alert visibility
4. **Memorable:** Bold visual choices (hexagonal patterns, pulsing animations, electric blue accents) create a unique, recognizable brand identity

**Implementation Choices:**

### Typography
- **Display Font:** Chakra Petch (geometric, Thai-inspired, technical but not overused)
- **Body Font:** Saira (clean, geometric, highly readable)
- **Rejected:** Inter (too common), Geist (generic), Space Grotesk (overused in tech), Orbitron (cliché for this aesthetic)

### Color Palette
- **Primary:** Electric blue (#00D9FF) - high-tech, visible, energetic
- **Dark Backgrounds:** Deep blue-blacks (#0A0E1A, #131825) - easier on eyes than pure black, maintains tech aesthetic
- **Severity Colors:** Neon variants (bright green, orange, red) with glow effects for immediate recognition
- **Rejected:** Light theme (doesn't convey control room), muted colors (reduces urgency perception)

### Visual Effects
- **Glow Effects:** Applied to all severity indicators, interactive elements, and critical alerts - reinforces "live system" feeling
- **Grid Patterns:** Subtle background grid and overlay patterns - technical precision aesthetic
- **Hexagonal Shapes:** Used in severity badges - geometric, technical, distinctive
- **Pulse Animations:** Applied to critical alerts only - draws attention without overuse
- **Staggered Entrances:** Event cards fade in with delays - sophisticated, polished feel

### Design Philosophy
- **Maximize Contrast:** Dark theme with bright accents ensures readability and information hierarchy
- **Purposeful Animation:** Animations serve functional purposes (draw attention to critical items, smooth entrances) rather than decoration
- **Technical Precision:** Grid alignments, geometric shapes, monospace for metadata - conveys reliability and accuracy
- **Restraint with Complexity:** Bold aesthetic but clean execution - no visual clutter

**Trade-offs Accepted:**
- Dark theme may require user adjustment period (but aligns with control room context)
- Glow effects increase CSS complexity (but worth it for distinctive appearance)
- Custom fonts add page weight (but Chakra Petch/Saira are well-optimized)

**Maintenance Impact:**
- All future frontend changes must follow frontend-design-guidelines.md
- Design tokens in globals.css provide consistency
- Component patterns established (badges, cards, navigation) should be replicated for new features

