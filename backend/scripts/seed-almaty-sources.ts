import { getDb, schema } from '../lib/db';

/**
 * Seed script for Almaty-specific data sources
 * Adds weather, air quality, and energy outage sources to the database
 */
async function seedAlmatySources() {
  console.log('Seeding Almaty data sources...');

  const db = getDb();

  try {
    // Almaty coordinates
    const ALMATY_LAT = process.env.ALMATY_LAT || '43.2220';
    const ALMATY_LNG = process.env.ALMATY_LNG || '76.8512';

    // 1. Weather Source (Open Meteo)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${ALMATY_LAT}&longitude=${ALMATY_LNG}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Asia/Almaty`;

    const weatherSource = await db.insert(schema.sources).values({
      name: 'Almaty Weather (Open Meteo)',
      type: 'json',
      url: weatherUrl,
      pollingIntervalSeconds: 3600, // 1 hour
      enabled: true,
      config: {
        description: 'Free weather data for Almaty from Open Meteo API',
        location: 'Almaty, Kazakhstan',
        latitude: parseFloat(ALMATY_LAT),
        longitude: parseFloat(ALMATY_LNG),
      },
    }).returning();

    console.log(`✓ Created weather source: ${weatherSource[0].id}`);

    // 2. Air Quality Source (air.org.kz)
    const airQualitySource = await db.insert(schema.sources).values({
      name: 'Almaty Air Quality (air.org.kz)',
      type: 'json',
      url: 'https://api.air.org.kz/api/city/districts',
      pollingIntervalSeconds: 1800, // 30 minutes
      enabled: true,
      config: {
        kind: 'air-quality',
        description: 'Air quality monitoring data for Almaty',
        location: 'Almaty, Kazakhstan',
        endpoint: 'city/districts',
      },
    }).returning();

    console.log(`✓ Created air quality source: ${airQualitySource[0].id}`);

    // 3. Energy Outage Source (AZhK) - Placeholder
    // TODO: Implement after HTML scraping adapter ready
    const energySource = await db.insert(schema.sources).values({
      name: 'AZhK Energy Outages',
      type: 'html',
      url: 'https://www.azhk.kz/ru/spetsialnye-razdely/all-graphics',
      pollingIntervalSeconds: 21600, // 6 hours
      enabled: false, // Disabled until adapter implemented
      config: {
        kind: 'energy',
        description: 'Planned energy outage schedules for Almaty',
        location: 'Almaty, Kazakhstan',
        locale: 'ru',
      },
    }).returning();

    console.log(`✓ Created energy source: ${energySource[0].id} (disabled)`);

    console.log('\n✓ Almaty sources seeded successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the worker to begin polling: bun run backend/worker/index.ts');
    console.log('2. Check ingestion logs in the database');
    console.log('3. View events in the API: curl http://localhost:3001/api/v1/events?type=weather');
  } catch (error) {
    console.error('Error seeding Almaty sources:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run seed script
seedAlmatySources();
