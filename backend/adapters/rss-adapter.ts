import * as cheerio from 'cheerio';
import type {
  SourceAdapter,
  NormalizedEvent,
  RawEvent,
} from '../shared/event-types';

/**
 * Parsed RSS/Atom feed item
 */
interface FeedItem {
  title?: string;
  description?: string;
  content?: string;
  link?: string;
  pubDate?: string | Date;
  updated?: string | Date;
  category?: string | string[];
  guid?: string;
  id?: string;
  geoLat?: string;
  geoLong?: string;
  point?: string;
}

/**
 * RSS/Atom Feed Source Adapter
 * Handles both RSS and Atom feeds
 */
export class RSSAdapter implements SourceAdapter {
  constructor(
    private sourceId: string,
    private url: string,
    private config: Record<string, unknown> = {}
  ) {}

  /**
   * Fetch RSS/Atom feed from source URL
   */
  async fetch(): Promise<RawEvent[]> {
    try {
      const response = await fetch(this.url, {
        headers: {
          'User-Agent': 'AlertFlow/1.0',
          'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        },
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();

      // Parse based on content type
      if (contentType.includes('json')) {
        return this.parseJSONFeed(text);
      }

      return this.parseXMLFeed(text);
    } catch (error) {
      console.error(`RSS fetch error for ${this.url}:`, error);
      throw error;
    }
  }

  /**
   * Parse JSON feed (JSON Feed format)
   */
  private parseJSONFeed(text: string): RawEvent[] {
    try {
      const feed = JSON.parse(text);

      // Handle different JSON feed formats
      const items = feed.items || feed.entries || [];

      if (!Array.isArray(items)) {
        return [];
      }

      return items as RawEvent[];
    } catch (error) {
      console.error('JSON feed parse error:', error);
      return [];
    }
  }

  /**
   * Parse XML feed (RSS/Atom)
   */
  private parseXMLFeed(text: string): RawEvent[] {
    try {
      const $ = cheerio.load(text, { xmlMode: true });
      const items: FeedItem[] = [];

      // Try RSS format first
      const rssItems = $('item').toArray();
      if (rssItems.length > 0) {
        for (const item of rssItems) {
          const $item = $(item);
          items.push({
            title: $item.find('title').text() || undefined,
            description: $item.find('description').text() ||
                          $item.find('content\\:encoded').text() || undefined,
            link: $item.find('link').text() ||
                    $item.find('guid').attr('isPermaLink') === 'true'
                    ? $item.find('guid').text() : undefined,
            pubDate: $item.find('pubDate').text() || undefined,
            category: $item.find('category').text() || undefined,
            guid: $item.find('guid').text() ||
                     $item.find('link').text() || undefined,
            geoLat: $item.find('geo\\:lat').text() || undefined,
            geoLong: $item.find('geo\\:long').text() || undefined,
          });
        }
      }

      // Try Atom format if no RSS items found
      if (items.length === 0) {
        const atomEntries = $('entry').toArray();
        for (const entry of atomEntries) {
          const $entry = $(entry);
          items.push({
            title: $entry.find('title').text() || undefined,
            description: $entry.find('summary').text() ||
                          $entry.find('content').text() || undefined,
            link: $entry.find('link').attr('href') || undefined,
            pubDate: $entry.find('published').text() ||
                     $entry.find('updated').text() || undefined,
            category: $entry.find('category').attr('term') || undefined,
            guid: $entry.find('id').text() || undefined,
          });
        }
      }

      return items as RawEvent[];
    } catch (error) {
      console.error('XML feed parse error:', error);
      return [];
    }
  }

  /**
   * Normalize a feed item to internal event model
   */
  normalize(raw: RawEvent): NormalizedEvent {
    const item = raw as FeedItem;

    // Extract original ID
    const originalId = item.guid || item.link || crypto.randomUUID();

    // Parse date
    let startTime = new Date();
    if (item.pubDate) {
      startTime = new Date(item.pubDate);
    } else if (item.updated) {
      startTime = new Date(item.updated);
    }

    // Determine event type from category
    const category = Array.isArray(item.category) ? item.category[0] : item.category;
    const type = this.mapCategoryToType(category);

    // Determine severity from category patterns
    const severity = this.mapCategoryToSeverity(category);

    // Extract location
    const location = this.extractLocation(item);

    // Clean HTML from description
    const description = this.cleanDescription(item.description || item.content || '');

    return {
      sourceId: this.sourceId,
      originalId,
      title: this.cleanText(item.title || 'Untitled Alert'),
      description: description?.substring(0, 5000), // Limit length
      severity,
      type,
      status: 'active',
      startTime,
      district: location.district,
      locationName: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      originalUrl: item.link,
      originalData: { ...item, _fetchedAt: new Date().toISOString() },
    };
  }

  /**
   * Map feed category to internal event type
   */
  private mapCategoryToType(category?: string): 'weather' | 'traffic' | 'public_safety' | 'health' | 'utility' | 'other' {
    if (!category) return 'other';
    const cat = category.toLowerCase();

    if (cat.includes('weather') || cat.includes('storm') || cat.includes('rain') ||
        cat.includes('flood') || cat.includes('temperature') || cat.includes('wind')) {
      return 'weather';
    }
    if (cat.includes('traffic') || cat.includes('road') || cat.includes('closure') ||
        cat.includes('accident') || cat.includes('delay')) {
      return 'traffic';
    }
    if (cat.includes('safety') || cat.includes('police') || cat.includes('fire') ||
        cat.includes('emergency') || cat.includes('crime')) {
      return 'public_safety';
    }
    if (cat.includes('health') || cat.includes('medical') || cat.includes('hospital')) {
      return 'health';
    }
    if (cat.includes('utility') || cat.includes('power') || cat.includes('water') ||
        cat.includes('gas') || cat.includes('outage')) {
      return 'utility';
    }
    return 'other';
  }

  /**
   * Map feed category to severity level
   */
  private mapCategoryToSeverity(category?: string): 'low' | 'medium' | 'high' | 'critical' {
    if (!category) return 'low';
    const cat = category.toLowerCase();

    if (cat.includes('critical') || cat.includes('emergency') || cat.includes('danger')) {
      return 'critical';
    }
    if (cat.includes('warning') || cat.includes('severe') || cat.includes('high')) {
      return 'high';
    }
    if (cat.includes('watch') || cat.includes('advisory') || cat.includes('moderate')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Extract location information from feed item
   */
  private extractLocation(item: FeedItem): {
    district?: string;
    name?: string;
    latitude?: number;
    longitude?: number;
  } {
    const result: ReturnType<typeof this.extractLocation> = {};

    // Try GeoRSS format
    if (item.geoLat && item.geoLong) {
      result.latitude = parseFloat(item.geoLat);
      result.longitude = parseFloat(item.geoLong);
    }

    // Try point format (lat,lng)
    if (item.point) {
      const [lat, lng] = item.point.split(',').map(s => s.trim());
      if (lat && lng) {
        result.latitude = parseFloat(lat);
        result.longitude = parseFloat(lng);
      }
    }

    // Try to extract location name from category or title
    const category = Array.isArray(item.category) ? item.category[0] : item.category;
    if (category) {
      // Look for patterns like "Downtown - Weather"
      const match = category.match(/^([\w\s]+)\s*-\s*\w+/);
      if (match) {
        result.district = match[1].toLowerCase().replace(/\s+/g, '_');
      }
    }

    return result;
  }

  /**
   * Clean HTML from description text
   */
  private cleanDescription(text: string): string {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
      .trim()
      .substring(0, 5000);
  }

  /**
   * Clean text content
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500);
  }
}

/**
 * Factory function to create RSS adapter
 */
export function createRSSAdapter(
  sourceId: string,
  url: string,
  config?: Record<string, unknown>
): RSSAdapter {
  return new RSSAdapter(sourceId, url, config);
}
