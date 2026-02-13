# ISSUES

**Project State Tracking - Blockers & Problems**

---

## 2025-02-12

---

*Session initialized. No issues encountered yet.*

---

## 2026-02-13 - Frontend Healthcheck Failure

---

**Issue:** Frontend Docker container marked as unhealthy despite application running

**Symptoms:**
- docker compose ps showed frontend status as "unhealthy"
- Next.js logs showed server listening on http://bd0cc5bd55d3:3000 (container hostname)
- Frontend accessible from host machine at http://localhost:3000 (port mapping worked)
- Healthcheck failing inside container: curl http://localhost:3000 returned connection refused

**Root Cause:**
- Next.js standalone server bound to container hostname (bd0cc5bd55d3) instead of 0.0.0.0
- Container's internal localhost didn't resolve to the Next.js server
- Healthcheck tried to curl localhost:3000 from inside container and failed

**Solution:**
- Added ENV HOSTNAME=0.0.0.0 to docker/Dockerfile.frontend production stage
- Forces Next.js to bind to all network interfaces (0.0.0.0) instead of hostname
- Healthcheck now succeeds, container marked as healthy

---

## 2026-02-13 - Telegram Bot Not Responding to /start Command

**Issue:** Telegram bot not responding when user sends /start command

**Symptoms:**
- Bot initialized but no response to commands
- Bot service instance created via getTelegramBotService() but never started
- No console output or errors

**Root Cause:**
1. Missing `eq` import from drizzle-orm in bot.service.ts (compilation error)
2. Bot service never had startWebhook() method called after initialization
3. No dedicated entry point to start and keep bot running
4. autoRetry plugin misconfigured for grammY v1.x API

**Solution:**
- Added `import { eq } from 'drizzle-orm'` to bot.service.ts
- Fixed autoRetry configuration: changed from client option to bot.api.config.use(autoRetry())
- Created backend/telegram/index.ts as bot entry point with:
  - Healthcheck server (port 3003)
  - Automatic polling mode when TELEGRAM_WEBHOOK_URL not set
  - Graceful shutdown handlers
- Added "telegram": "bun run backend/telegram/index.ts" to package.json scripts
- Fixed null handling in /status command for subscription filters
- Bot now runs continuously and responds to all commands

**Status:** RESOLVED
