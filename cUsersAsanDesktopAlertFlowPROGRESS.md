
## 2026-02-13 - Docker Frontend Service

- Created docker/Dockerfile.frontend with multi-stage build for Next.js
  - Uses oven/bun:1 as base image
  - Multi-stage build: deps → builder → production
  - Installs curl for healthchecks
  - Runs as non-root user (bun)
  - Exposes port 3000
- Updated next.config.ts to use 'standalone' output mode for Docker
- Added frontend service to docker-compose.yml
  - Maps port 3000:3000 (host:container)
  - Configures NEXT_PUBLIC_API_URL to point to API service
  - Depends on API service being healthy
  - Includes healthcheck endpoint
  - Auto-restart policy: unless-stopped

### Fix: Dockerfile.frontend build error

- Removed COPY tailwind.config.ts line (file doesn't exist - using Tailwind v4 CSS-based config)
- Cleaned up redundant tsconfig.json copy
- Dockerfile now only copies files that actually exist

### Fix: Bun install command in Dockerfile.frontend

- Changed 'bun install --frozen-lockfile --production=false' to 'bun install --frozen-lockfile'
- Bun's --production flag doesn't accept values (unlike npm/yarn)
- Default behavior installs all dependencies including devDependencies

### Fix: TypeScript error in event-card.tsx

- Fixed 'config' implicitly has type 'any' error in StatusBadge component
- Split config definition into two steps to avoid circular reference
- Renamed to statusConfig for clarity and accessed separately
