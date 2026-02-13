
## 2026-02-13 - Docker Frontend Build Error

**Issue**: Dockerfile.frontend failed with 'tailwind.config.ts: not found'

**Cause**: Project uses Tailwind v4 which uses CSS-based configuration instead of a separate config file

**Resolution**: Removed COPY tailwind.config.ts line from Dockerfile

**Status**: RESOLVED
