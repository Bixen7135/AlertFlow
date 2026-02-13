import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Mock data loader for testing and fallback scenarios
 * Loads static JSON mock data files when APIs are unavailable
 */
export class MockDataLoader {
  private enabled: boolean;
  private mocksDir: string;

  constructor() {
    this.enabled = process.env.USE_MOCK_DATA === 'true' || process.env.ENABLE_MOCK_FALLBACK === 'true';
    // mock-loader.ts is inside the mocks directory, so __dirname already points to mocks/
    this.mocksDir = __dirname;
  }

  /**
   * Check if mock data loading is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Load mock data for a specific source type
   * @param sourceType - Type of source (weather, air-quality, energy)
   * @returns Parsed JSON data from mock file
   */
  async loadMockData<T = any>(sourceType: string): Promise<T> {
    if (!this.enabled) {
      throw new Error('Mock data loading is disabled. Set USE_MOCK_DATA=true or ENABLE_MOCK_FALLBACK=true');
    }

    const filename = `${sourceType}-mock.json`;
    const filepath = join(this.mocksDir, filename);

    try {
      const content = await readFile(filepath, 'utf-8');
      const data = JSON.parse(content);
      console.log(`[MockDataLoader] Loaded mock data for ${sourceType} from ${filename}`);
      return data as T;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[MockDataLoader] Failed to load mock data for ${sourceType}:`, message);
      throw new Error(`Mock data file not found or invalid: ${filename}`);
    }
  }

  /**
   * Load weather mock data
   */
  async loadWeatherMock() {
    return this.loadMockData('weather');
  }

  /**
   * Load air quality mock data
   */
  async loadAirQualityMock() {
    return this.loadMockData('air-quality');
  }

  /**
   * Load energy outage mock data
   */
  async loadEnergyMock() {
    return this.loadMockData('energy');
  }
}

// Singleton instance
export const mockDataLoader = new MockDataLoader();
