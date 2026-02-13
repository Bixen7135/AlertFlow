import { getDb, schema } from '../lib/db';

/**
 * Seed script for Shymkent-specific data sources
 * Adds weather source to the database
 *
 * Shymkent coordinates: 42.3000° N, 69.6000° E
 * Timezone: Asia/Almaty
 */
async function seedShymkentSources() {
  console.log('Seeding Shymkent data sources...');

  const db = getDb();
  const SHYMKENT_LAT = process.env.SHYMKENT_LAT || '42.3000';
  const SHYMKENT_LNG = process.env.SHYMKENT_LNG || '69.6000';

  try {
    // Weather Source (Open Meteo)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${SHYMKENT_LAT}&longitude=${SHYMKENT_LNG}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Asia/Almaty`;

    const weatherSource = await db.insert(schema.sources).values({
      name: 'Shymkent Weather (Open Meteo)',
      type: 'json',
      url: weatherUrl,
      pollingIntervalSeconds: 3600, // 1 hour
      enabled: true,
      config: {
        kind: 'weather',
        description: 'Free weather data for Shymkent from Open Meteo API',
        location: 'Шымкент, Казахстан',
        city: 'shymkent',
        cityEn: 'Shymkent',
        cityKk: 'Шымкент',
        cityRu: 'Шымкент',
        latitude: parseFloat(SHYMKENT_LAT),
        longitude: parseFloat(SHYMKENT_LNG),
        timezone: 'Asia/Almaty',
      },
    }).returning();

    console.log(`? Created weather source: ${weatherSource[0].id}`);

    console.log('\n? Shymkent sources seeded successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the worker to begin polling: bun run worker');
    console.log('2. Check ingestion logs in the database');
    console.log('3. View events in the API: curl http://localhost:3001/api/v1/events?type=weather');
  } catch (error) {
    console.error('Error seeding Shymkent sources:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run seed script
seedShymkentSources();
