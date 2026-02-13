import type {
  SourceAdapter,
  NormalizedEvent,
  RawEvent,
} from '../shared/event-types';
import { mockDataLoader } from './mocks/mock-loader';

/**
 * Open Meteo Weather API Response
 */
interface WeatherAPIResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    is_day: number;
    time: string;
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
}

/**
 * Weather Adapter for Open Meteo API
 * Free weather API with no authentication required
 * Documentation: https://open-meteo.com/en/docs
 */
export class WeatherAdapter implements SourceAdapter {
  constructor(
    private sourceId: string,
    private url: string,
    private config: Record<string, unknown> = {}
  ) {}

  /**
   * Fetch weather data from Open Meteo API
   */
  async fetch(): Promise<RawEvent[]> {
    try {
      const response = await fetch(this.url, {
        headers: {
          'User-Agent': 'AlertFlow/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: WeatherAPIResponse = await response.json();

      // Convert API response to raw events (one event per day forecast)
      return this.parseWeatherData(data);
    } catch (error) {
      console.error(`Weather API fetch error for ${this.url}:`, error);

      // Try mock data fallback if enabled
      if (mockDataLoader.isEnabled()) {
        console.log('[WeatherAdapter] Falling back to mock data');
        const mockData = await mockDataLoader.loadWeatherMock();
        return this.parseWeatherData(mockData as WeatherAPIResponse);
      }

      throw error;
    }
  }

  /**
   * Parse Open Meteo response into raw events
   */
  private parseWeatherData(data: WeatherAPIResponse): RawEvent[] {
    const events: RawEvent[] = [];

    // Current weather event
    if (data.current_weather) {
      events.push({
        id: `weather_current_${data.current_weather.time}`,
        time: data.current_weather.time,
        weathercode: data.current_weather.weathercode,
        temperature: data.current_weather.temperature,
        windspeed: data.current_weather.windspeed,
        is_current: true,
        latitude: data.latitude,
        longitude: data.longitude,
      });
    }

    // Daily forecast events
    if (data.daily && data.daily.time) {
      for (let i = 0; i < data.daily.time.length; i++) {
        events.push({
          id: `weather_daily_${data.daily.time[i]}`,
          time: data.daily.time[i],
          weathercode: data.daily.weathercode[i],
          temperature_max: data.daily.temperature_2m_max[i],
          temperature_min: data.daily.temperature_2m_min[i],
          precipitation: data.daily.precipitation_sum[i],
          is_current: false,
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    }

    return events;
  }

  /**
   * Normalize weather data to internal event model
   */
  normalize(raw: RawEvent): NormalizedEvent {
    const weathercode = (raw as any).weathercode ?? 0;
    const isCurrent = (raw as any).is_current ?? false;
    const time = (raw as any).time;
    const temperature = (raw as any).temperature;
    const temperatureMax = (raw as any).temperature_max;
    const temperatureMin = (raw as any).temperature_min;
    const precipitation = (raw as any).precipitation ?? 0;
    const latitude = (raw as any).latitude ?? 43.2220; // Almaty default
    const longitude = (raw as any).longitude ?? 76.8512;

    // Map weather code to condition and severity
    const condition = this.mapWeathercodeToCondition(weathercode);
    const severity = this.mapWeathercodeToSeverity(weathercode);

    // Build title
    const title = isCurrent
      ? `${condition} in Almaty`
      : `${condition} forecast for ${this.formatDate(time)}`;

    // Build description
    let description = '';
    if (isCurrent) {
      description = `Current temperature: ${temperature}°C. ${this.getHealthRecommendation(weathercode, temperature)}`;
    } else {
      description = `Temperature: ${temperatureMin}°C to ${temperatureMax}°C`;
      if (precipitation > 0) {
        description += `, Precipitation: ${precipitation}mm`;
      }
      description += `. ${this.getHealthRecommendation(weathercode, temperatureMax)}`;
    }

    // Determine start and end time
    const startTime = new Date(time);
    const endTime = isCurrent ? undefined : new Date(time + 'T23:59:59');

    return {
      sourceId: this.sourceId,
      originalId: (raw as any).id || `weather_${time}_${weathercode}`,
      title,
      description,
      severity,
      type: 'weather',
      status: 'active',
      startTime,
      endTime,
      locationName: 'Almaty',
      latitude,
      longitude,
      originalData: { ...raw, _fetchedAt: new Date().toISOString() },
    };
  }

  /**
   * Map WMO weather code to human-readable condition
   * WMO Weather interpretation codes (WW)
   * https://open-meteo.com/en/docs
   */
  private mapWeathercodeToCondition(code: number): string {
    if (code === 0) return 'Clear sky';
    if (code === 1) return 'Mainly clear';
    if (code === 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Fog';
    if (code === 51 || code === 53 || code === 55) return 'Drizzle';
    if (code === 56 || code === 57) return 'Freezing drizzle';
    if (code === 61 || code === 63 || code === 65) return 'Rain';
    if (code === 66 || code === 67) return 'Freezing rain';
    if (code === 71 || code === 73 || code === 75) return 'Snow';
    if (code === 77) return 'Snow grains';
    if (code === 80 || code === 81 || code === 82) return 'Rain showers';
    if (code === 85 || code === 86) return 'Snow showers';
    if (code === 95) return 'Thunderstorm';
    if (code === 96 || code === 99) return 'Thunderstorm with hail';
    return 'Unknown weather';
  }

  /**
   * Map weather code to severity level
   */
  private mapWeathercodeToSeverity(code: number): 'low' | 'medium' | 'high' | 'critical' {
    // Clear/mainly clear - low
    if (code <= 1) return 'low';

    // Partly cloudy/overcast - low
    if (code <= 3) return 'low';

    // Fog, drizzle - medium
    if (code <= 57) return 'medium';

    // Rain, freezing rain, snow - medium to high
    if (code <= 77) return code >= 66 ? 'high' : 'medium';

    // Rain showers, snow showers - medium to high
    if (code <= 86) return code >= 82 ? 'high' : 'medium';

    // Thunderstorm - critical
    if (code >= 95) return 'critical';

    return 'low';
  }

  /**
   * Get health/safety recommendations based on weather
   */
  private getHealthRecommendation(weathercode: number, temperature: number): string {
    const recommendations: string[] = [];

    // Cold weather warnings
    if (temperature < -20) {
      recommendations.push('Extreme cold: Avoid prolonged outdoor exposure. Risk of frostbite within minutes.');
    } else if (temperature < -10) {
      recommendations.push('Very cold: Dress warmly in layers. Limit outdoor activities.');
    } else if (temperature < 0) {
      recommendations.push('Cold weather: Wear warm clothing and stay dry.');
    }

    // Hot weather warnings
    if (temperature > 35) {
      recommendations.push('Extreme heat: Stay hydrated and avoid prolonged sun exposure.');
    } else if (temperature > 30) {
      recommendations.push('Hot weather: Drink plenty of water and take breaks in shade.');
    }

    // Weather-specific warnings
    if (weathercode >= 95) {
      recommendations.push('Thunderstorm warning: Stay indoors, avoid open areas and metal objects.');
    } else if (weathercode >= 80) {
      recommendations.push('Heavy precipitation: Exercise caution on roads and walkways.');
    } else if (weathercode >= 66) {
      recommendations.push('Freezing conditions: Be extremely careful, roads may be icy.');
    } else if (weathercode >= 45) {
      recommendations.push('Low visibility: Drive carefully and use fog lights.');
    }

    return recommendations.length > 0
      ? recommendations.join(' ')
      : 'Normal weather conditions.';
  }

  /**
   * Format date for display
   */
  private formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }
}

/**
 * Factory function to create Weather adapter
 */
export function createWeatherAdapter(
  sourceId: string,
  url: string,
  config?: Record<string, unknown>
): WeatherAdapter {
  return new WeatherAdapter(sourceId, url, config);
}
