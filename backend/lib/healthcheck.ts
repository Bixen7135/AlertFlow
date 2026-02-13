/**
 * Simple HTTP healthcheck server for workers
 * Provides a /health endpoint that can be queried by Docker healthchecks
 */

import { serve, Server } from 'bun';

let healthcheckServer: Server | null = null;
let isHealthy = false;

/**
 * Start a simple HTTP server for healthchecks
 * @param port Port to listen on (default 3000)
 */
export function startHealthcheckServer(port: number = 3000): void {
  if (healthcheckServer) {
    console.log('Healthcheck server already running');
    return;
  }

  healthcheckServer = serve({
    port,
    fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === '/health') {
        if (isHealthy) {
          return new Response(
            JSON.stringify({
              status: 'healthy',
              timestamp: new Date().toISOString(),
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        } else {
          return new Response(
            JSON.stringify({
              status: 'unhealthy',
              timestamp: new Date().toISOString(),
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      }

      return new Response('Not Found', { status: 404 });
    },
  });

  console.log(`Healthcheck server listening on port ${port}`);
}

/**
 * Mark the service as healthy
 */
export function markHealthy(): void {
  isHealthy = true;
}

/**
 * Mark the service as unhealthy
 */
export function markUnhealthy(): void {
  isHealthy = false;
}

/**
 * Stop the healthcheck server
 */
export function stopHealthcheckServer(): void {
  if (healthcheckServer) {
    healthcheckServer.stop();
    healthcheckServer = null;
    console.log('Healthcheck server stopped');
  }
}
