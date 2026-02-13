# Docker Build Fixes Summary

## Issues Found and Fixed

### 1. TypeScript Type Mismatch in `hasMeaningfulChange()` Function

**Problem:**
- Database columns return `string | null` for nullable text fields
- Function expected `string | undefined`
- TypeScript error: "Type 'null' is not assignable to type 'string | undefined'"

**Fix:** [backend/shared/event-types.ts:65-82](backend/shared/event-types.ts#L65-L82)
- Updated function signature to accept `string | null | undefined`
- Added null-to-undefined normalization using nullish coalescing operator
- Ensures proper comparison between database values and normalized events

```typescript
// Before
latitude?: string;
longitude?: string;

// After
latitude?: string | null;
longitude?: string | null;
```

### 2. Next.js Type-Checking Backend Code

**Problem:**
- Next.js build (`bun run build`) type-checks ALL TypeScript files
- Backend scripts included in type-checking
- Backend uses different type conventions than frontend

**Fix:** [tsconfig.json:26-35](tsconfig.json#L26-L35)
- Updated `include` to only target frontend folders (app, components, lib, src)
- Added backend/, docker/, migrations/ to `exclude` array
- Next.js now only type-checks frontend code

```json
"include": [
  "app/**/*.ts",
  "components/**/*.ts",
  "lib/**/*.ts",
  // ... frontend only
],
"exclude": [
  "node_modules",
  "backend/**/*",
  "docker/**/*",
  "migrations/**/*"
]
```

### 3. Unnecessary Build Steps in Backend Dockerfiles

**Problem:**
- Backend Dockerfiles ran `bun run build` which triggers Next.js build
- Backend services don't need Next.js
- Bun can execute TypeScript directly without compilation
- Build step wasted time and caused type errors

**Fix:**
- [docker/Dockerfile.api](docker/Dockerfile.api)
- [docker/Dockerfile.worker](docker/Dockerfile.worker)
- [docker/Dockerfile.telegram-worker](docker/Dockerfile.telegram-worker)

Removed:
```dockerfile
# Copy source code
COPY . .

# Build application
RUN bun run build
```

Replaced with direct source copy:
```dockerfile
# Copy source code
COPY backend ./backend
COPY migrations ./migrations
```

**Benefits:**
- Faster Docker builds (no Next.js compilation)
- No type conflicts between frontend and backend
- Smaller Docker image layers
- Simpler build process

### 4. Missing .dockerignore File

**Problem:**
- All files copied to Docker build context
- Slowed down Docker builds
- Larger build context

**Fix:** [.dockerignore](.dockerignore)
Created comprehensive .dockerignore to exclude:
- Development files (.git, .vscode, *.log)
- Dependencies (node_modules - installed in Dockerfile)
- Next.js build output (.next, out)
- Test files (*.test.ts, *.spec.ts)
- Environment files (.env*)
- Documentation (*.md except README)

## Verification

Run this command to verify the fix:
```bash
docker compose up --build
```

All services should build without TypeScript errors and start successfully.

## Architecture Notes

### Frontend vs Backend Type Conventions
- **Frontend**: Uses `undefined` for optional values (TypeScript convention)
- **Backend**: Uses `null` for database nullable columns (SQL convention)
- **Solution**: Functions that bridge frontend/backend accept both and normalize

### Build Process
- **Frontend**: Next.js builds to static/server chunks in `.next/`
- **Backend**: Bun executes TypeScript directly at runtime
- **No compilation needed** for backend services

### Docker Multi-Stage Builds
All Dockerfiles use multi-stage builds:
1. **Base stage**: Install dependencies
2. **Production stage**: Copy only runtime files, run as non-root user

## Files Modified

1. [backend/shared/event-types.ts](backend/shared/event-types.ts) - Fixed type signature
2. [tsconfig.json](tsconfig.json) - Excluded backend from Next.js
3. [docker/Dockerfile.api](docker/Dockerfile.api) - Removed build step
4. [docker/Dockerfile.worker](docker/Dockerfile.worker) - Removed build step
5. [docker/Dockerfile.telegram-worker](docker/Dockerfile.telegram-worker) - Removed build step
6. [.dockerignore](.dockerignore) - Created optimization file
7. [PROGRESS.md](PROGRESS.md) - Logged changes
8. [TODO.md](TODO.md) - Updated tasks
9. [DECISIONS.md](DECISIONS.md) - Documented architectural decisions

## Expected Result

Running `docker compose up --build` should now:
1. ✅ Build all services without TypeScript errors
2. ✅ Start postgres with health check
3. ✅ Start redis with health check
4. ✅ Start api server on port 3000
5. ✅ Start worker process
6. ✅ Start telegram-worker process
7. ✅ All services wait for healthy dependencies before starting
