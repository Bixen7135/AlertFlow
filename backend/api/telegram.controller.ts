import { Hono } from 'hono';
import { getTelegramBotService } from '../telegram/bot.service';

/**
 * Telegram webhook and bot controller
 * Handles Telegram webhook and bot commands
 */
export function createTelegramController() {
  const controller = new Hono();

  // Webhook endpoint for Telegram updates
  controller.post('/webhook', async (c) => {
    try {
      const update = await c.req.json();

      // Process update through bot service
      const botService = getTelegramBotService();
      if (botService) {
        await botService.handleUpdate(update);
      }

      return c.json({ ok: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return c.json({ ok: false, error: 'Webhook processing failed' }, 500);
    }
  });

  // Test endpoint for webhook connectivity
  controller.get('/webhook', (c) => {
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_SECRET;

    return c.json({
      status: 'webhook endpoint ready',
      webhookUrl,
      instructions: 'Set this URL as your Telegram bot webhook',
    });
  });

  return controller;
}

export const telegramController = createTelegramController();
