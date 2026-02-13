import { getDb, schema } from '../lib/db';

/**
 * City configuration for Kazakhstan
 */
interface CityConfig {
  name: string;
  nameEn: string;
  nameKk: string;
  nameRu: string;
  lat: string;
  lng: string;
  timezone: string;
  hasAirQuality: boolean;
  hasEnergy: boolean;
}

/**
 * Kazakhstan cities configuration
 */
const CITIES: Record<string, CityConfig> = {
  almaty: {
    name: 'Almaty',
    nameEn: 'Almaty',
    nameKk: 'Алматы',
    nameRu: 'Алматы',
    lat: '43.2220',
    lng: '76.8512',
    timezone: 'Asia/Almaty',
    hasAirQuality: true,
    hasEnergy: true,
  },
  astana: {
    name: 'Astana',
    nameEn: 'Astana',
    nameKk: 'Астана',
    nameRu: 'Астана',
    lat: '51.1605',
    lng: '71.4704',
    timezone: 'Asia/Almaty',
    hasAirQuality: false,
    hasEnergy: false,
  },
  shymkent: {
    name: 'Shymkent',
    nameEn: 'Shymkent',
    nameKk: 'Шымкент',
    nameRu: 'Шымкент',
    lat: '42.3000',
    lng: '69.6000',
    timezone: 'Asia/Almaty',
    hasAirQuality: false,
    hasEnergy: false,
  },
  kyzylorda: {
    name: 'Kyzylorda',
    nameEn: 'Kyzylorda',
    nameKk: 'Кызылорда',
    nameRu: 'Кызылорда',
    lat: '44.8523',
    lng: '65.5086',
    timezone: 'Asia/Qyzylorda',
    hasAirQuality: false,
    hasEnergy: false,
  },
};

/**
 * Seed script for all Kazakhstan cities
 * Adds weather, air quality, and energy outage sources to the database
 */
async function seedKazakhstanCities(cityKey?: string) {
  console.log('Seeding Kazakhstan cities data sources...');

  const db = getDb();
  const citiesToSeed = cityKey ? [cityKey] : Object.keys(CITIES);

  try {
    for (const key of citiesToSeed) {
      const city = CITIES[key];
      if (!city) {
        console.log(`? City ${key} not found, skipping...`);
        continue;
      }

      console.log(`\n? Seeding ${city.name}...`);

      // 1. Weather Source (Open Meteo) - Available for all cities
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=${city.timezone}`;

      const weatherSource = await db.insert(schema.sources).values({
        name: `${city.nameEn} Weather (Open Meteo)`,
        type: 'json',
        url: weatherUrl,
        pollingIntervalSeconds: 3600, // 1 hour
        enabled: true,
        config: {
          kind: 'weather',
          description: `Free weather data for ${city.nameEn} from Open Meteo API`,
          location: `${city.nameRu}, Казахстан`,
          city: city.name,
          cityEn: city.nameEn,
          cityKk: city.nameKk,
          cityRu: city.nameRu,
          latitude: parseFloat(city.lat),
          longitude: parseFloat(city.lng),
          timezone: city.timezone,
        },
      }).returning();

      console.log(`  ? Created weather source: ${weatherSource[0].id}`);

      // 2. Air Quality Source (air.org.kz) - Only for Almaty
      if (city.hasAirQuality) {
        const airQualitySource = await db.insert(schema.sources).values({
          name: `${city.nameEn} Air Quality (air.org.kz)`,
          type: 'json',
          url: 'https://api.air.org.kz/api/city/districts',
          pollingIntervalSeconds: 1800, // 30 minutes
          enabled: true,
          config: {
            kind: 'air-quality',
            description: `Air quality monitoring data for ${city.nameEn}`,
            location: `${city.nameRu}, Казахстан`,
            endpoint: 'city/districts',
            city: city.name,
            cityEn: city.nameEn,
            cityKk: city.nameKk,
            cityRu: city.nameRu,
          },
        }).returning();

        console.log(`  ? Created air quality source: ${airQualitySource[0].id}`);
      }

      // 3. Energy Outage Source (AZhK) - Only for Almaty
      if (city.hasEnergy) {
        const energySource = await db.insert(schema.sources).values({
          name: `AZhK Energy Outages (${city.nameEn})`,
          type: 'html',
          url: 'https://www.azhk.kz/ru/spetsialnye-razdely/all-graphics',
          pollingIntervalSeconds: 21600, // 6 hours
          enabled: false, // Disabled until adapter is verified
          config: {
            kind: 'energy',
            description: `Planned energy outage schedules for ${city.nameEn}`,
            location: `${city.nameRu}, Казахстан`,
            locale: 'ru',
            city: city.name,
            cityEn: city.nameEn,
            cityKk: city.nameKk,
            cityRu: city.nameRu,
          },
        }).returning();

        console.log(`  ? Created energy source: ${energySource[0].id} (disabled)`);
      }
    }

    console.log('\n? Kazakhstan cities seeded successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the worker to begin polling: bun run worker');
    console.log('2. Check ingestion logs in the database');
    console.log('3. View events in the API: curl http://localhost:3001/api/v1/events?type=weather');
  } catch (error) {
    console.error('Error seeding Kazakhstan cities:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const cityKey = args[0]; // Optional: specify a single city to seed

// Run seed script
seedKazakhstanCities(cityKey);
