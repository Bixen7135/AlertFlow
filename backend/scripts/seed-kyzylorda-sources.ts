import { getDb, schema } from '../lib/db';

/**
 * Seed script for Kyzylorda-specific data sources
 * Adds weather source to the database
 *
 * Kyzylorda coordinates: 44.8523° N, 65.5086° E
 * Timezone: Asia/Qyzylorda
 */
async function seedKyzylordaSources() {
  console.log('Seeding Kyzylorda data sources...');

  const db = getDb();
  const KYZYLORDA_LAT = process.env.KYZYLORDA_LAT || '44.8523';
  const KYZYLORDA_LNG = process.env.KYZYLORDA_LNG || '65.5086';

  try {
    // Weather Source (Open Meteo)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${KYZYLORDA_LAT}&longitude=${KYZYLORDA_LNG}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Asia/Qyzylorda`;

    const weatherSource = await db.insert(schema.sources).values({
      name: 'Kyzylorda Weather (Open Meteo)',
      type: 'json',
      url: weatherUrl,
      pollingIntervalSeconds: 3600, // 1 hour
      enabled: true,
      config: {
        kind: 'weather',
        description: 'Free weather data for Kyzylorda from Open Meteo API',
        location: 'Кызылорда, Казахстан',
        city: 'kyzylorda',
        cityEn: 'Kyzylorda',
        cityKk: 'Кызылорда',
        cityRu: 'Кызылорда',
        latitude: parseFloat(KYZYLORDA_LAT),
        longitude: parseFloat(KYZYLORDA_LNG),
        timezone: 'Asia/Qyzylorda',
      },
    }).returning();

    console.log(`? Created weather source: ${weatherSource[0].id}`);

    console.log('\n? Kyzylorda sources seeded successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the worker to begin polling: bun run worker');
    console.log('2. Check ingestion logs in the database');
    console.log('3. View events in the API: curl http://localhost:3001/api/v1/events?type=weather');
  } catch (error) {
    console.error('Error seeding Kyzylorda sources:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run seed script
seedKyzylordaSources();
