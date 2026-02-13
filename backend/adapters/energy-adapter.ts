import * as cheerio from 'cheerio';
import type {
  SourceAdapter,
  NormalizedEvent,
  RawEvent,
} from '../shared/event-types';
import { mockDataLoader } from './mocks/mock-loader';

/**
 * AZhK Energy Outage data structure
 */
interface EnergyOutage {
  id: string;
  address: string;
  district?: string;
  start_time: string;
  end_time: string;
  reason: string;
  type: string;
  affected_count?: string;
}

/**
 * Parsed outage event
 */
interface ParsedOutage {
  id: string;
  address: string;
  district?: string;
  startTime: Date;
  endTime: Date;
  reason: string;
  type: string;
  affectedCount?: string;
}

/**
 * AZhK Energy Adapter for Almaty power outages
 * Scrapes planned outage schedules from AZhK website
 * URL: https://www.azhk.kz/ru/spetsialnye-razdely/all-graphics
 *
 * Note: Coordinates will be null until 2GIS Geocoding API key is available
 * Addresses are stored in locationName for future geocoding
 */
export class EnergyAdapter implements SourceAdapter {
  constructor(
    private sourceId: string,
    private url: string,
    private config: Record<string, unknown> = {}
  ) {}

  /**
   * Fetch energy outage data from AZhK website
   */
  async fetch(): Promise<RawEvent[]> {
    try {
      const response = await fetch(this.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Parse HTML content
      return this.parseEnergyData(html);
    } catch (error) {
      console.error(`Energy Adapter fetch error for ${this.url}:`, error);

      // Try mock data fallback if enabled
      if (mockDataLoader.isEnabled()) {
        console.log('[EnergyAdapter] Falling back to mock data');
        const mockData = await mockDataLoader.loadEnergyMock();
        return this.parseMockData(mockData as any);
      }

      throw error;
    }
  }

  /**
   * Parse HTML content from AZhK website
   * Extracts outage information from tables or structured content
   */
  private parseEnergyData(html: string): RawEvent[] {
    const events: RawEvent[] = [];
    const $ = cheerio.load(html);

    // AZhK website structure may vary - try multiple selectors
    // Common patterns: tables, divs with specific classes, etc.

    // Try to find table rows with outage information
    const tableRows = $('table tr, .outage-row, .schedule-item');

    if (tableRows.length === 0) {
      console.warn('[EnergyAdapter] No outage rows found in HTML');
      return events;
    }

    tableRows.each((index, element) => {
      const $row = $(element);
      const text = $row.text();

      // Try to extract structured data from the row
      // Look for date patterns, addresses, etc.
      const outage = this.extractOutageFromRow($row);

      if (outage) {
        events.push({
          id: outage.id,
          address: outage.address,
          district: outage.district,
          start_time: outage.startTime.toISOString(),
          end_time: outage.endTime.toISOString(),
          reason: outage.reason,
          type: outage.type,
          affected_count: outage.affectedCount,
        });
      }
    });

    return events;
  }

  /**
   * Extract outage information from a table row
   */
  private extractOutageFromRow($row: cheerio.Cheerio<any>): ParsedOutage | null {
    const cells = $row.find('td').toArray();

    if (cells.length < 3) {
      return null;
    }

    const $ = cheerio;
    const getText = (el: cheerio.Element) => $(el).text().trim();

    // Try to identify columns by content patterns
    let address = '';
    let dateStr = '';
    let timeRange = '';
    let reason = '';
    let district = '';

    // Look for address patterns (Russian: ул., пр., мкр., etc.)
    for (const cell of cells) {
      const text = getText(cell);

      if (text.match(/(ул\.|пр\.|мкр\.|улица|проспект|микрорайон)/i)) {
        address = text;

        // Try to extract district from address
        const districtMatch = text.match(/(?:р-н\s+|район\s+)([А-Яа-яЁёA-Za-z]+)/i);
        if (districtMatch) {
          district = districtMatch[1];
        }
      }

      // Look for date patterns (Russian: DD.MM.YYYY)
      if (text.match(/\d{1,2}\.\d{1,2}\.\d{2,4}/)) {
        dateStr = text;
      }

      // Look for time range (HH:MM-HH:MM or HH:MM - HH:MM)
      if (text.match(/\d{1,2}:\d{2}/)) {
        timeRange = text;
      }

      // Look for reason keywords
      if (text.match(/(ремонт|замена|обслуживание|модернизация|плановые|работы)/i)) {
        reason = text;
      }
    }

    if (!address || !dateStr) {
      return null;
    }

    // Parse date and time
    const startTime = this.parseRussianDateTime(dateStr, timeRange.split('-')[0]?.trim());
    const endTime = this.parseRussianDateTime(dateStr, timeRange.split('-')[1]?.trim());

    if (!startTime || !endTime) {
      return null;
    }

    // Generate ID from content hash
    const id = `azhk_${this.hashContent(address + dateStr + timeRange)}`;

    return {
      id,
      address,
      district,
      startTime,
      endTime,
      reason: reason || 'Плановые работы',
      type: 'planned',
    };
  }

  /**
   * Parse Russian date and time to Date object
   */
  private parseRussianDateTime(dateStr: string, timeStr?: string): Date | null {
    try {
      // Parse DD.MM.YYYY or DD/MM/YYYY format
      const dateMatch = dateStr.match(/(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})/);

      if (!dateMatch) {
        return null;
      }

      const [, day, month, year] = dateMatch;
      const fullYear = year.length === 2 ? `20${year}` : year;

      // Parse time if provided
      let hours = '09';
      let minutes = '00';

      if (timeStr) {
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          [, hours, minutes] = timeMatch;
        }
      }

      // Construct ISO date string
      const isoDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes}:00`;

      return new Date(isoDate);
    } catch {
      return null;
    }
  }

  /**
   * Simple hash function for ID generation
   */
  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Parse mock data for testing
   */
  private parseMockData(mockData: { outages: EnergyOutage[] }): RawEvent[] {
    const events: RawEvent[] = [];

    for (const outage of mockData.outages) {
      events.push({
        id: outage.id,
        address: outage.address,
        district: outage.district,
        start_time: outage.start_time,
        end_time: outage.end_time,
        reason: outage.reason,
        type: outage.type,
        affected_count: outage.affected_count,
      });
    }

    return events;
  }

  /**
   * Normalize energy outage data to internal event model
   */
  normalize(raw: RawEvent): NormalizedEvent {
    const address = (raw as any).address || 'Unknown Address';
    const district = (raw as any).district;
    const startTime = new Date((raw as any).start_time);
    const endTime = new Date((raw as any).end_time);
    const reason = (raw as any).reason || 'Плановые работы';
    const affectedCount = (raw as any).affected_count;

    // Get city name from config (for future expansion)
    const config = this.config || {};
    const cityName = config.cityEn || config.city || 'Almaty';
    const locationCity = config.location || config.cityRu || `${cityName}, Казахстан`;

    // Determine severity based on duration and affected count
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (durationHours > 8 || (affectedCount && parseInt(affectedCount) > 500)) {
      severity = 'high';
    } else if (durationHours > 4 || (affectedCount && parseInt(affectedCount) > 300)) {
      severity = 'medium';
    }

    // Check if event is still active
    const now = new Date();
    const status: 'active' | 'updated' | 'resolved' | 'cancelled' =
      now > endTime ? 'resolved' : 'active';

    // Build title
    const title = `Электроснабжение: ${address}`;

    // Build description
    const description = this.buildDescription(reason, startTime, endTime, affectedCount);

    // Normalize district name
    const normalizedDistrict = district?.toLowerCase().replace(/\s+/g, '_');

    return {
      sourceId: this.sourceId,
      originalId: (raw as any).id || `energy_${address}_${startTime.getTime()}`,
      title,
      description,
      severity,
      type: 'utility',
      status,
      startTime,
      endTime,
      district: normalizedDistrict,
      locationName: address,
      latitude: null, // Will be added via 2GIS geocoding when API key is available
      longitude: null,
      originalData: { ...raw, _fetchedAt: new Date().toISOString() },
    };
  }

  /**
   * Build detailed description for energy outage
   */
  private buildDescription(reason: string, startTime: Date, endTime: Date, affectedCount?: string): string {
    const parts: string[] = [];

    // Reason
    parts.push(`Причина: ${reason}`);

    // Time range
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };
    parts.push(`Время: ${formatTime(startTime)} - ${formatTime(endTime)}`);

    // Affected count
    if (affectedCount) {
      parts.push(`Затронуто: ${affectedCount}`);
    }

    return parts.join('. ');
  }
}

/**
 * Factory function to create Energy adapter
 */
export function createEnergyAdapter(
  sourceId: string,
  url: string,
  config?: Record<string, unknown>
): EnergyAdapter {
  return new EnergyAdapter(sourceId, url, config);
}
