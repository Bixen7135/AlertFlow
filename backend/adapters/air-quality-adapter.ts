import type {
  SourceAdapter,
  NormalizedEvent,
  RawEvent,
} from '../shared/event-types';
import { mockDataLoader } from './mocks/mock-loader';

/**
 * air.org.kz API Response for district data
 */
interface AirQualityDistrictData {
  district: string;
  pm25: number;
  pm10?: number;
  datetime: string;
  lat?: number;
  lon?: number;
  station_count?: number;
}

/**
 * air.org.kz API Response for PM2.5 latest data
 */
interface AirQualityStation {
  id: string;
  name: string;
  pm25: number;
  pm10?: number;
  lat: number;
  lon: number;
  district: string;
  datetime: string;
  origin?: string;
}

/**
 * Air Quality Adapter for air.org.kz API
 * Free public API for Almaty air quality monitoring
 * Documentation: https://api.air.org.kz/docs
 */
export class AirQualityAdapter implements SourceAdapter {
  private baseUrl = 'https://api.air.org.kz/api';

  constructor(
    private sourceId: string,
    private url: string,
    private config: Record<string, unknown> = {}
  ) {}

  /**
   * Fetch air quality data from air.org.kz API
   */
  async fetch(): Promise<RawEvent[]> {
    try {
      // Use district-level data for aggregated city view
      const endpoint = this.config.endpoint || 'city/districts';
      const apiUrl = this.url || `${this.baseUrl}/${endpoint}`;

      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'AlertFlow/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Convert API response to raw events
      return this.parseAirQualityData(data);
    } catch (error) {
      console.error(`Air Quality API fetch error for ${this.url}:`, error);

      // Try mock data fallback if enabled
      if (mockDataLoader.isEnabled()) {
        console.log('[AirQualityAdapter] Falling back to mock data');
        const mockData = await mockDataLoader.loadAirQualityMock();
        return this.parseAirQualityData((mockData as any).data);
      }

      throw error;
    }
  }

  /**
   * Parse air.org.kz response into raw events
   */
  private parseAirQualityData(data: any): RawEvent[] {
    const events: RawEvent[] = [];

    // Handle array response (district or station data)
    const records = Array.isArray(data) ? data : [data];

    for (const record of records) {
      // Skip invalid records
      if (!record || record.pm25 === null || record.pm25 === undefined) {
        continue;
      }

      const event: RawEvent = {
        id: record.id || `aqi_${record.district}_${record.datetime}`,
        station_name: record.name || record.district,
        district: record.district,
        pm25: record.pm25,
        pm10: record.pm10,
        aqi: this.calculateAQI(record.pm25, record.pm10),
        latitude: record.lat,
        longitude: record.lon,
        datetime: record.datetime,
        station_count: record.station_count,
        origin: record.origin || 'air.org.kz',
      };

      events.push(event);
    }

    return events;
  }

  /**
   * Normalize air quality data to internal event model
   */
  normalize(raw: RawEvent): NormalizedEvent {
    const pm25 = (raw as any).pm25 ?? 0;
    const pm10 = (raw as any).pm10;
    const aqi = (raw as any).aqi ?? this.calculateAQI(pm25, pm10);
    const stationName = (raw as any).station_name || 'Unknown Station';
    const district = (raw as any).district;
    const latitude = (raw as any).latitude;
    const longitude = (raw as any).longitude;
    const datetime = (raw as any).datetime;

    // Map AQI to severity
    const severity = this.mapAQIToSeverity(aqi);
    const healthStatus = this.getHealthStatus(aqi);

    // Build title
    const title = `Air Quality ${healthStatus} - ${stationName}`;

    // Build description
    const description = this.buildDescription(aqi, pm25, pm10, healthStatus);

    // Determine start time
    const startTime = datetime ? new Date(datetime) : new Date();

    return {
      sourceId: this.sourceId,
      originalId: (raw as any).id || `aqi_${district}_${startTime.getTime()}`,
      title,
      description,
      severity,
      type: 'health',
      status: 'active',
      startTime,
      district: district?.toLowerCase().replace(/\s+/g, '_'),
      locationName: stationName,
      latitude,
      longitude,
      originalData: { ...raw, _fetchedAt: new Date().toISOString() },
    };
  }

  /**
   * Calculate AQI from PM2.5 and PM10
   * Uses US EPA AQI formula
   */
  private calculateAQI(pm25: number, pm10?: number): number {
    // US EPA AQI breakpoints for PM2.5
    const pm25Breakpoints = [
      { low: 0.0, high: 12.0, aqiLow: 0, aqiHigh: 50 },
      { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
      { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
      { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
      { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
      { low: 250.5, high: 500.0, aqiLow: 301, aqiHigh: 500 },
    ];

    // Find applicable breakpoint
    let aqi = 0;
    for (const bp of pm25Breakpoints) {
      if (pm25 >= bp.low && pm25 <= bp.high) {
        aqi = Math.round(
          ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (pm25 - bp.low) + bp.aqiLow
        );
        break;
      }
    }

    // If PM2.5 exceeds highest breakpoint
    if (pm25 > 500) {
      aqi = 500;
    }

    return aqi;
  }

  /**
   * Map AQI value to severity level
   */
  private mapAQIToSeverity(aqi: number): 'low' | 'medium' | 'high' | 'critical' {
    if (aqi <= 50) return 'low'; // Good
    if (aqi <= 100) return 'medium'; // Moderate
    if (aqi <= 150) return 'high'; // Unhealthy for Sensitive Groups
    return 'critical'; // Unhealthy to Hazardous
  }

  /**
   * Get health status label from AQI
   */
  private getHealthStatus(aqi: number): string {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  /**
   * Build detailed description with health recommendations
   */
  private buildDescription(aqi: number, pm25: number, pm10?: number, healthStatus: string): string {
    const parts: string[] = [];

    // AQI and pollutants
    parts.push(`AQI: ${aqi}`);
    parts.push(`PM2.5: ${pm25.toFixed(1)} µg/m³`);
    if (pm10) {
      parts.push(`PM10: ${pm10.toFixed(1)} µg/m³`);
    }

    // Primary pollutant
    parts.push(`Primary pollutant: PM2.5`);

    // Health recommendation
    const recommendation = this.getHealthRecommendation(aqi);
    if (recommendation) {
      parts.push(`Health recommendation: ${recommendation}`);
    }

    return parts.join(', ');
  }

  /**
   * Get health recommendations based on AQI level
   */
  private getHealthRecommendation(aqi: number): string {
    if (aqi <= 50) {
      return 'Air quality is satisfactory, and air pollution poses little or no risk.';
    }
    if (aqi <= 100) {
      return 'Unusually sensitive people should consider reducing prolonged or heavy outdoor exertion.';
    }
    if (aqi <= 150) {
      return 'People with respiratory or heart disease, the elderly, and children should limit prolonged outdoor exertion.';
    }
    if (aqi <= 200) {
      return 'Everyone may begin to experience health effects. Avoid prolonged outdoor exertion.';
    }
    if (aqi <= 300) {
      return 'Health alert: everyone may experience more serious health effects. Avoid all outdoor exertion.';
    }
    return 'Health warning: emergency conditions. Everyone should avoid all outdoor exertion and remain indoors.';
  }
}

/**
 * Factory function to create Air Quality adapter
 */
export function createAirQualityAdapter(
  sourceId: string,
  url: string,
  config?: Record<string, unknown>
): AirQualityAdapter {
  return new AirQualityAdapter(sourceId, url, config);
}
