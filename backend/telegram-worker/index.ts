/**
 * AlertFlow Telegram Delivery Worker
 * Consumes jobs from queue and sends messages to Telegram users
 */

import { Worker, Job } from 'bullmq';
import { eq, sql, and } from 'drizzle-orm';
import { getDb, schema, waitForTables } from '../lib/db';
import { getTelegramQueue } from '../lib/queue';
import { TelegramBotService } from '../telegram/bot.service';
import { startHealthcheckServer, markHealthy, markUnhealthy, stopHealthcheckServer } from '../lib/healthcheck';

interface TelegramDeliveryJob {
  eventId: string;
  eventType: string;
  severity: string;
  title: string;
}

async function main() {
  try {
    console.log('Telegram Delivery Worker starting...');

    // Start healthcheck server first (initially unhealthy)
    const healthPort = parseInt(process.env.HEALTH_PORT || '3000');
    startHealthcheckServer(healthPort);

    // Wait for database tables to exist
    console.log('Waiting for database migrations to complete...');
    await waitForTables();

    const queue = getTelegramQueue();
    const db = getDb();

  // Create the worker
  const worker = new Worker<TelegramDeliveryJob>(
    'telegram-deliveries',
    async (job: Job<TelegramDeliveryJob>) => {
      const { eventId, eventType, severity, title } = job.data;

      console.log(`Processing delivery job ${job.id}: Event ${eventId}`);

      try {
        // Find matching subscriptions
        const subscriptions = await db.query.telegramSubscriptions.findMany({
          where: (conds) => {
            const conditions = [];

            // Match event type filter
            // '*' means all types, otherwise check if event type is in the list
            conditions.push(
              sql`(
                ${schema.telegramSubscriptions.eventTypesFilter} @> ARRAY['*']::text
                OR ${eventType} = ANY(subscription.event_types_filter)
              )`
            );

            // Match district filter
            // '*' means all districts, otherwise check for exact match or wildcard
            conditions.push(
              sql`(
                ${schema.telegramSubscriptions.districtFilter} = '*'
                OR EXISTS (
                  SELECT 1 FROM UNNEST(${schema.telegramSubscriptions.districtFilter}) AS t
                  WHERE t = ${eventId}
                )
              )`
            );

            return and(...conditions);
          },
        });

        console.log(`Found ${subscriptions.length} matching subscriptions`);

        let successCount = 0;
        let failureCount = 0;

        // Send messages to each matching subscription
        for (const subscription of subscriptions) {
          try {
            const message = TelegramBotService.formatAlertMessage({
              title,
              severity,
              type: eventType,
              startTime: new Date(),
            });

            // Send via bot service (direct Telegram API call)
            // Note: In production, this would call the Telegram Bot API directly
            console.log(`Would send to chat ${subscription.telegramChatId}:`, message.substring(0, 100));

            successCount++;
          } catch (error) {
            console.error(`Failed to send to ${subscription.telegramChatId}:`, error);
            failureCount++;
          }
        }

        console.log(`Job ${job.id} complete: ${successCount} sent, ${failureCount} failed`);

        // Move job to completed
        await job.updateProgress(100);

        return {
          success: successCount,
          failed: failureCount,
        };
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        throw error;
      }
    },
    {
      connection: {
        host: new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname,
        port: parseInt(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port) || 6379,
      },
      concurrency: 5, // Process up to 5 jobs concurrently
      limiter: {
        max: 100, // Max 100 jobs per minute
        duration: 60000, // Per 60 seconds
      },
    }
  );

  // Event listeners
  worker.on('completed', (job: Job<TelegramDeliveryJob>, result: any) => {
    console.log(`Job ${job.id} completed:`, result);
  });

  worker.on('failed', (job: Job<TelegramDeliveryJob>, error: Error) => {
    console.error(`Job ${job.id} failed permanently:`, error.message);
  });

  worker.on('progress', (job: Job<TelegramDeliveryJob>, progress: number) => {
    // Log progress for long-running jobs
    if (progress % 25 === 0) {
      console.log(`Job ${job.id} progress: ${progress}%`);
    }
  });

    // Mark as healthy once worker is running
    markHealthy();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nReceived SIGINT, closing worker...');
      markUnhealthy();
      await worker.close();
      stopHealthcheckServer();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nReceived SIGTERM, closing worker...');
      markUnhealthy();
      await worker.close();
      stopHealthcheckServer();
      process.exit(0);
    });

    console.log('Telegram Delivery Worker running. Press Ctrl+C to stop.');
  } catch (error) {
    console.error('Failed to start telegram worker:', error);
    markUnhealthy();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Telegram worker crashed:', error);
  process.exit(1);
});
