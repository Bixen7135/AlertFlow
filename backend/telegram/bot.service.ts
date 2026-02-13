import { Bot, GrammyError } from 'grammy';
import { autoRetry } from '@grammyjs/auto-retry';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../lib/db';

interface SubscriptionFilters {
  eventTypes: string[];
  district: string;
}

/**
 * Telegram Bot Service
 * Handles bot commands, webhook, and user interactions
 */
export class TelegramBotService {
  private bot: Bot;
  private adminKey: string;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set');
    }

    this.adminKey = process.env.ADMIN_KEY || 'D9O0Gk8SK2MFyYAR9HCu6VGd';

    // Initialize bot
    this.bot = new Bot(token);

    // Configure auto-retry for API calls
    this.bot.api.config.use(autoRetry({
      maxRetryAttempts: 3,
      maxDelaySeconds: 60,
    }));

    this.setupCommands();
    this.setupMiddleware();
  }

  /**
   * Setup bot commands
   */
  private setupCommands(): void {
    // Start command
    this.bot.command('start', async (ctx) => {
      const userId = ctx.from?.id;
      const chatId = ctx.chat?.id;

      if (!userId || !chatId) {
        return;
      }

      // Create or update subscription
      await this.ensureSubscription(userId.toString(), chatId.toString());

      await ctx.reply(
        '👋 Welcome to AlertFlow!\n\n' +
          'I will send you alerts based on your subscriptions.\n\n' +
          'Commands:\n' +
          '/subscribe - Subscribe to alerts\n' +
          '/unsubscribe - Unsubscribe from alerts\n' +
          '/help - Show this help message\n' +
          'Use /subscribe to customize what alerts you receive.'
      );
    });

    // Help command
    this.bot.command('help', async (ctx) => {
      await ctx.reply(
        '📖 *AlertFlow Help*\n\n' +
          'Commands:\n' +
          '/start - Subscribe to alerts\n' +
          '/subscribe - Customize your subscriptions\n' +
          '/unsubscribe - Unsubscribe from alerts\n' +
          '/status - View your subscriptions\n' +
          '*Alert Types:* weather, traffic, public_safety, health, utility\n' +
          '*Severity:* low, medium, high, critical'
      );
    });

    // Subscribe command
    this.bot.command('subscribe', async (ctx) => {
      const userId = ctx.from?.id;
      const chatId = ctx.chat?.id;

      if (!userId || !chatId) {
        return;
      }

      // Parse subscription filters from command args
      const args = ctx.message?.text?.split(' ') || [];
      const filters = this.parseSubscribeArgs(args);

      // Update subscription
      await this.updateSubscription(userId.toString(), chatId.toString(), filters);

      const filterText = this.formatFilters(filters);
      await ctx.reply(
        `✅ Subscription updated!\n\n${filterText}\n\nYou will receive alerts matching these criteria.`
      );
    });

    // Unsubscribe command
    this.bot.command('unsubscribe', async (ctx) => {
      const userId = ctx.from?.id;
      const chatId = ctx.chat?.id;

      if (!userId || !chatId) {
        return;
      }

      await this.removeSubscription(userId.toString(), chatId.toString());

      await ctx.reply(
        '❌ You have been unsubscribed from AlertFlow alerts.\n\n' +
          'Use /start to subscribe again.'
      );
    });

    // Status command
    this.bot.command('status', async (ctx) => {
      const userId = ctx.from?.id?.toString();

      if (!userId) {
        return;
      }

      const subscription = await this.getSubscription(userId);

      if (!subscription) {
        await ctx.reply(
          '📭 You are not subscribed to any alerts.\n\n' +
          'Use /subscribe to start receiving alerts.'
        );
        return;
      }

      const filterText = this.formatFilters({
        eventTypes: subscription.eventTypesFilter || ['*'],
        district: subscription.districtFilter || '*',
      });

      await ctx.reply(
        `📊 *Your Subscription*\n\n${filterText}\n\nSubscribed: ${new Date(subscription.createdAt).toLocaleDateString()}`
      );
    });
  }

  /**
   * Setup middleware for authentication
   */
  private setupMiddleware(): void {
    // Admin-only middleware for management commands
    this.bot.use(async (ctx, next) => {
      const command = ctx.message?.text?.split(' ')[0];

      if (command === '/admin') {
        const adminKey = ctx.message?.text?.split(' ')[1];
        if (adminKey !== this.adminKey) {
          await ctx.reply('❌ Invalid admin key');
          return;
        }
      }

      return next();
    });
  }

  /**
   * Parse subscription arguments from command
   */
  private parseSubscribeArgs(args: string[]): SubscriptionFilters {
    const filters: SubscriptionFilters = {
      eventTypes: ['*'], // Default: all types
      district: '*', // Default: all districts
    };

    for (const arg of args) {
      const [key, value] = arg.split('=');

      switch (key) {
        case 'type':
        case 'types':
          if (value === 'all') {
            filters.eventTypes = ['*'];
          } else {
            filters.eventTypes = value.split(',').map(t => t.trim());
          }
          break;

        case 'district':
          filters.district = value || '*';
          break;
      }
    }

    return filters;
  }

  /**
   * Format filters for display
   */
  private formatFilters(filters: SubscriptionFilters): string {
    const parts: string[] = [];

    // Event types
    const types = filters.eventTypes.includes('*') || filters.eventTypes.length === 0
      ? 'All types'
      : filters.eventTypes.join(', ');

    parts.push(`🏷 *Types:* ${types}`);

    // District
    const district = filters.district === '*' ? 'All districts' : filters.district;
    parts.push(`📍 *District:* ${district}`);

    return parts.join('\n');
  }

  /**
   * Ensure subscription exists for user
   */
  private async ensureSubscription(
    telegramUserId: string,
    telegramChatId: string
  ): Promise<void> {
    const db = getDb();

    const existing = await db.query.telegramSubscriptions.findFirst({
      where: eq(schema.telegramSubscriptions.telegramUserId, telegramUserId),
    });

    if (!existing) {
      await db.insert(schema.telegramSubscriptions).values({
        telegramUserId,
        telegramChatId,
        eventTypesFilter: ['*'],
        districtFilter: '*',
      });
    }
  }

  /**
   * Update subscription with new filters
   */
  private async updateSubscription(
    telegramUserId: string,
    telegramChatId: string,
    filters: SubscriptionFilters
  ): Promise<void> {
    const db = getDb();

    const existing = await db.query.telegramSubscriptions.findFirst({
      where: eq(schema.telegramSubscriptions.telegramUserId, telegramUserId),
    });

    if (existing) {
      await db
        .update(schema.telegramSubscriptions)
        .set({
          eventTypesFilter: filters.eventTypes,
          districtFilter: filters.district,
          updatedAt: new Date(),
        })
        .where(eq(schema.telegramSubscriptions.id, existing.id));
    } else {
      await db.insert(schema.telegramSubscriptions).values({
        telegramUserId,
        telegramChatId,
        eventTypesFilter: filters.eventTypes,
        districtFilter: filters.district,
      });
    }
  }

  /**
   * Remove subscription
   */
  private async removeSubscription(
    telegramUserId: string,
    telegramChatId: string
  ): Promise<void> {
    const db = getDb();

    await db
      .delete(schema.telegramSubscriptions)
      .where(eq(schema.telegramSubscriptions.telegramUserId, telegramUserId));
  }

  /**
   * Get subscription for user
   */
  private async getSubscription(telegramUserId: string) {
    const db = getDb();

    return await db.query.telegramSubscriptions.findFirst({
      where: eq(schema.telegramSubscriptions.telegramUserId, telegramUserId),
    });
  }

  /**
   * Start bot with webhook
   */
  async startWebhook(): Promise<void> {
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;

    if (!webhookUrl) {
      console.log('Starting bot in polling mode (no webhook URL set)...');
      await this.bot.start();
      return;
    }

    console.log(`Setting webhook: ${webhookUrl}`);
    await this.bot.api.setWebhook(webhookUrl);

    // Start handling updates via webhook
    this.bot.start();
  }

  /**
   * Stop bot
   */
  async stop(): Promise<void> {
    await this.bot.stop();
  }

  /**
   * Format alert message for delivery
   */
  static formatAlertMessage(event: {
    title: string;
    description?: string;
    severity: string;
    type: string;
    district?: string;
    locationName?: string;
    startTime: Date;
    originalUrl?: string;
  }): string {
    const severityIcons: Record<string, string> = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    };

    const severityLabel: Record<string, string> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'CRITICAL',
    };

    const typeLabels: Record<string, string> = {
      weather: 'Weather',
      traffic: 'Traffic',
      public_safety: 'Public Safety',
      health: 'Health',
      utility: 'Utility',
      other: 'Other',
    };

    const icon = severityIcons[event.severity] || '⚠️';
    const severityText = severityLabel[event.severity] || event.severity.toUpperCase();
    const typeText = typeLabels[event.type] || event.type;

    let message = `${icon} ${severityText} ${typeText}\n`;
    message += `*${event.title}*\n`;

    if (event.description) {
      message += `\n${event.description}\n`;
    }

    message += `\n📍 ${event.locationName || event.district || 'Unknown location'} | ⏰ ${event.startTime.toLocaleString()}`;

    if (event.originalUrl) {
      message += `\n🔗 [More info](${event.originalUrl})`;
    }

    return message;
  }

  /**
   * Handle incoming Telegram update
   */
  async handleUpdate(update: any): Promise<void> {
    try {
      await this.bot.handleUpdate(update);
    } catch (error) {
      console.error('Error handling update:', error);
    }
  }
}

// Lazy initialization - only create bot service when actually needed
let instance: TelegramBotService | null = null;

export function getTelegramBotService(): TelegramBotService | null {
  if (!instance) {
    try {
      instance = new TelegramBotService();
    } catch (error) {
      console.error('Failed to initialize Telegram bot service:', error);
      return null;
    }
  }
  return instance;
}

