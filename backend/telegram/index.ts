/**
 * Telegram Bot Entry Point
 * Starts the Telegram bot in polling or webhook mode
 */

import { getTelegramBotService } from './bot.service';
import { startHealthcheckServer, markHealthy, markUnhealthy, stopHealthcheckServer } from '../lib/healthcheck';

async function main() {
  try {
    console.log('Telegram Bot starting...');

    // Start healthcheck server
    const healthPort = parseInt(process.env.TELEGRAM_HEALTH_PORT || '3003');
    startHealthcheckServer(healthPort);
    console.log(`Healthcheck server on port ${healthPort}`);

    // Get and start bot service
    const botService = getTelegramBotService();

    if (!botService) {
      throw new Error('Failed to initialize Telegram bot service');
    }

    // Start bot (will use webhook if URL is set, otherwise polling)
    await botService.startWebhook();
    console.log('Telegram bot started successfully!');

    // Mark as healthy
    markHealthy();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nReceived SIGINT, stopping bot...');
      markUnhealthy();
      await botService.stop();
      stopHealthcheckServer();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nReceived SIGTERM, stopping bot...');
      markUnhealthy();
      await botService.stop();
      stopHealthcheckServer();
      process.exit(0);
    });

    console.log('Telegram bot is running. Press Ctrl+C to stop.');
  } catch (error) {
    console.error('Failed to start Telegram bot:', error);
    markUnhealthy();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Telegram bot crashed:', error);
  process.exit(1);
});
