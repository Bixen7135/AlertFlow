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
