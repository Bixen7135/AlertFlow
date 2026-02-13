import { getDb, schema } from '../lib/db';

/**
 * Seed script for Astana-specific data sources
 * Adds weather source to the database
 *
 * Astana coordinates: 51.1605° N, 71.4704° E
 * Timezone: Asia/Almaty
 */
async function seedAstanaSources() {
  console.log('Seeding Astana data sources...');

  const db = getDb();
  const ASTANA_LAT = process.env.ASTANA_LAT || '51.1605';
  const ASTANA_LNG = process.env.ASTANA_LNG || '71.4704';

  try {
    // Weather Source (Open Meteo)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${ASTANA_LAT}&longitude=${ASTANA_LNG}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Asia/Almaty`;

    const weatherSource = await db.insert(schema.sources).values({
      name: 'Astana Weather (Open Meteo)',
      type: 'json',
      url: weatherUrl,
      pollingIntervalSeconds: 3600, // 1 hour
      enabled: true,
      config: {
        kind: 'weather',
        description: 'Free weather data for Astana from Open Meteo API',
        location: 'Астана, Казахстан',
        city: 'astana',
        cityEn: 'Astana',
        cityKk: 'Астана',
        cityRu: 'Астана',
        latitude: parseFloat(ASTANA_LAT),
        longitude: parseFloat(ASTANA_LNG),
        timezone: 'Asia/Almaty',
      },
    }).returning();

    console.log(`? Created weather source: ${weatherSource[0].id}`);

    console.log('\n? Astana sources seeded successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the worker to begin polling: bun run worker');
    console.log('2. Check ingestion logs in the database');
    console.log('3. View events in the API: curl http://localhost:3001/api/v1/events?type=weather');
  } catch (error) {
    console.error('Error seeding Astana sources:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run seed script
seedAstanaSources();
