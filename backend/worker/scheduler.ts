import { eq } from 'drizzle-orm';
import { getDb, schema } from '../lib/db';
import { createRSSAdapter } from '../adapters/rss-adapter';
import { createWeatherAdapter } from '../adapters/weather-adapter';
import { ingestionService } from './ingestion.service';

interface ScheduledSource {
  id: string;
  name: string;
  type: string;
  url: string;
  pollingIntervalSeconds: number;
  config: Record<string, unknown>;
  enabled: boolean;
}

/**
 * Source polling scheduler
 * Manages scheduled polling of enabled sources
 */
export class Scheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  /**
   * Start the scheduler
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Scheduler already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting ingestion scheduler...');

    // Load and schedule all enabled sources
    await this.scheduleSources();

    // Reschedule every minute to pick up new/updated sources
    setInterval(() => {
      this.scheduleSources();
    }, 60000);

    console.log('Scheduler started');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    console.log('Stopping scheduler...');

    for (const [sourceId, timeout] of this.intervals) {
      clearTimeout(timeout);
      console.log(`Stopped polling for source ${sourceId}`);
    }

    this.intervals.clear();
    this.isRunning = false;
  }

  /**
   * Load enabled sources and schedule them
   */
  private async scheduleSources(): Promise<void> {
    const db = getDb();

    const sources = await db.query.sources.findMany({
      where: eq(schema.sources.enabled, true),
    });

    for (const source of sources) {
      this.scheduleSource(source as ScheduledSource);
    }
  }

  /**
   * Schedule a single source for polling
   */
  private scheduleSource(source: ScheduledSource): void {
    const { id, name } = source;

    // Clear existing interval if any
    const existing = this.intervals.get(id);
    if (existing) {
      clearTimeout(existing);
    }

    // Calculate initial delay (stagger sources to avoid thundering herd)
    const initialDelay = Math.random() * 30000; // 0-30 seconds

    // Schedule first poll
    const timeout = setTimeout(() => {
      this.pollSource(source);
    }, initialDelay);

    this.intervals.set(id, timeout);
    console.log(`Scheduled source "${name}" (${id}): first poll in ${Math.round(initialDelay / 1000)}s`);
  }

  /**
   * Poll a single source
   */
  private async pollSource(source: ScheduledSource): Promise<void> {
    const { id, name, type, url, config } = source;
    const startTime = new Date();

    console.log(`[${new Date().toISOString()}] Polling source "${name}" (${type})`);

    try {
      // Create appropriate adapter based on source type
      const adapter = this.createAdapter(source);

      // Fetch raw events
      const rawEvents = await adapter.fetch();
      console.log(`[${new Date().toISOString()}] Fetched ${rawEvents.length} items from "${name}"`);

      // Normalize events
      const normalizedEvents = rawEvents.map(raw => adapter.normalize(raw));
      const validEvents = normalizedEvents.filter(e => e.title && e.startTime);

      console.log(`[${new Date().toISOString()}] Normalized ${validEvents.length} valid events from "${name}"`);

      // Process events
      const result = await ingestionService.processEvents(
        source as any,
        validEvents
      );

      // Log successful ingestion
      const status = result.errors.length > 0 ? 'partial' : 'success';
      await ingestionService.logIngestion(id, result, status);
      await ingestionService.updateSourceTimestamps(id, true);

      console.log(
        `[${new Date().toISOString()}] Ingestion complete for "${name}": ` +
        `${result.eventsCreated} created, ${result.eventsUpdated} updated`
      );

      if (result.errors.length > 0) {
        console.warn(`[${new Date().toISOString()}] Errors for "${name}":`, result.errors);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${new Date().toISOString()}] Poll failed for "${name}":`, message);

      // Log failed ingestion
      await ingestionService.logIngestion(
        id,
        {
          sourceId: id,
          eventsFound: 0,
          eventsCreated: 0,
          eventsUpdated: 0,
          errors: [message],
        },
        'error'
      );

      await ingestionService.updateSourceTimestamps(id, false);
    }

    // Reschedule next poll
    const elapsed = Date.now() - startTime.getTime();
    const delay = Math.max(
      source.pollingIntervalSeconds * 1000 - elapsed,
      60000 // Minimum 1 minute between polls
    );

    const timeout = setTimeout(() => {
      this.pollSource(source);
    }, delay);

    this.intervals.set(id, timeout);
    console.log(`[${new Date().toISOString()}] Next poll for "${name}" in ${Math.round(delay / 1000)}s`);
  }

  /**
   * Create adapter for source type
   */
  private createAdapter(source: ScheduledSource) {
    switch (source.type) {
      case 'rss':
        return createRSSAdapter(source.id, source.url, source.config);

      case 'json':
        // JSON adapter - currently used for weather API
        // Will be extended for air quality and other JSON APIs
        return createWeatherAdapter(source.id, source.url, source.config);

      // Future: HTML scraper adapter
      // case 'html':
      //   return createHTMLAdapter(source.id, source.url, source.config);

      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  /**
   * Get scheduled sources count
   */
  getScheduledCount(): number {
    return this.intervals.size;
  }

  /**
   * Get scheduler status
   */
  getStatus(): { running: boolean; sources: number } {
    return {
      running: this.isRunning,
      sources: this.intervals.size,
    };
  }
}

export const scheduler = new Scheduler();
