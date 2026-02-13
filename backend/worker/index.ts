/**
 * AlertFlow Ingestion Worker
 * Polls external sources, normalizes events, and stores in database
 */

import { scheduler } from './scheduler';
import { waitForTables } from '../lib/db';
import { startHealthcheckServer, markHealthy, markUnhealthy, stopHealthcheckServer } from '../lib/healthcheck';

async function main() {
  try {
    console.log('Ingestion Worker starting...');

    // Start healthcheck server first (initially unhealthy)
    const healthPort = parseInt(process.env.HEALTH_PORT || '3000');
    startHealthcheckServer(healthPort);

    // Wait for database tables to exist
    console.log('Waiting for database migrations to complete...');
    await waitForTables();

    console.log('Initializing scheduler...');

    // Start the polling scheduler
    await scheduler.start();

    // Mark as healthy once fully initialized
    markHealthy();
    console.log('Worker running. Press Ctrl+C to stop.');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nReceived SIGINT, shutting down gracefully...');
      markUnhealthy();
      scheduler.stop();
      stopHealthcheckServer();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\nReceived SIGTERM, shutting down gracefully...');
      markUnhealthy();
      scheduler.stop();
      stopHealthcheckServer();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start worker:', error);
    markUnhealthy();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Worker crashed:', error);
  process.exit(1);
});
