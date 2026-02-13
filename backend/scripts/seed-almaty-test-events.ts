import { getDb, schema } from '../lib/db';
import type { NewEvent } from '../shared/schema';

/**
 * Seed script for test events across Almaty landmarks
 * Creates events with actual coordinates for popular locations
 */
async function seedAlmatyTestEvents() {
  console.log('Seeding Almaty test events...');

  const db = getDb();

  try {
    // Create or get test source
    let [source] = await db.select().from(schema.sources).where({ name: 'Almaty Test Events' } as any).limit(1);

    if (!source) {
      [source] = await db.insert(schema.sources).values({
        name: 'Almaty Test Events',
        type: 'json',
        url: 'https://example.com/test',
        pollingIntervalSeconds: 3600,
        enabled: true,
        config: {
          description: 'Test events for Almaty landmarks',
          location: 'Almaty, Kazakhstan',
        },
      }).returning();
      console.log('Created test source:', source.id);
    }

    const now = new Date();

    // Test events with real Almaty coordinates
    const testEvents: Omit<NewEvent, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        fingerprint: `almaty_test_gorky_park_${now.getTime()}`,
        sourceId: source.id,
        originalId: 'test_gorky_park',
        title: 'Концерт в Парке Горького',
        description: 'Бесплатный концерт живой музыки в Парке Горького. Начало в 18:00',
        severity: 'low',
        type: 'other',
        status: 'active',
        startTime: new Date(now.getTime() + 7200000), // 2 hours from now
        district: 'Medeu',
        locationName: 'Парк Горького',
        latitude: '43.2612',
        longitude: '76.9571',
        originalData: { test: true },
      },
      {
        fingerprint: `almaty_test_mega_${now.getTime()}`,
        sourceId: source.id,
        originalId: 'test_mega',
        title: 'Распродажа в MEGA Alma-Ata',
        description: 'Большая распродажа в ТРЦ MEGA. Скидки до 70%',
        severity: 'low',
        type: 'other',
        status: 'active',
        startTime: new Date(now.getTime() - 3600000), // Started 1 hour ago
        endTime: new Date(now.getTime() + 86400000), // Ends tomorrow
        district: 'Bostandyk',
        locationName: 'MEGA Alma-Ata',
        latitude: '43.2006',
        longitude: '76.8692',
        originalData: { test: true },
      },
      {
        fingerprint: `almaty_test_republic_square_${now.getTime()}`,
        sourceId: source.id,
        originalId: 'test_republic_square',
        title: 'Дорожные работы на площади Республики',
        description: 'Временное ограничение движения в связи с дорожными работами',
        severity: 'medium',
        type: 'traffic',
        status: 'active',
        startTime: new Date(now.getTime() - 7200000), // Started 2 hours ago
        district: 'Almaly',
        locationName: 'Площадь Республики',
        latitude: '43.2566',
        longitude: '76.9286',
        originalData: { test: true },
      },
      {
        fingerprint: `almaty_test_medeo_${now.getTime()}`,
        sourceId: source.id,
        originalId: 'test_medeo',
        title: 'Погодное предупреждение - Медео',
        description: 'Ожидается снегопад в горной местности. Рекомендуется соблюдать осторожность',
        severity: 'high',
        type: 'weather',
        status: 'active',
        startTime: new Date(now.getTime() + 3600000), // 1 hour from now
        district: 'Medeu',
        locationName: 'Медео',
        latitude: '43.1639',
        longitude: '77.0797',
        originalData: { test: true },
      },
      {
        fingerprint: `almaty_test_shymbulak_${now.getTime()}`,
        sourceId: source.id,
        originalId: 'test_shymbulak',
        title: 'Отличные условия для катания - Шымбулак',
        description: 'Свежий снег, все трассы открыты. Отличная видимость',
        severity: 'low',
        type: 'weather',
        status: 'active',
        startTime: now,
        district: 'Medeu',
        locationName: 'Шымбулак',
        latitude: '43.1289',
        longitude: '77.0792',
        originalData: { test: true },
      },
      {
        fingerprint: `almaty_test_dostyk_plaza_${now.getTime()}`,
        sourceId: source.id,
        originalId: 'test_dostyk_plaza',
        title: 'Отключение воды - Достык Плаза',
        description: 'Плановое отключение воды для технических работ с 10:00 до 16:00',
        severity: 'medium',
        type: 'utility',
        status: 'active',
        startTime: new Date(now.getTime() - 1800000), // Started 30 min ago
        endTime: new Date(now.getTime() + 14400000), // Ends in 4 hours
        district: 'Medeu',
        locationName: 'Достык Плаза',
        latitude: '43.2400',
        longitude: '76.9456',
        originalData: { test: true },
      },
      {
        fingerprint: `almaty_test_arbat_${now.getTime()}`,
        sourceId: source.id,
        originalId: 'test_arbat',
        title: 'Фестиваль на Арбате',
        description: 'Культурный фестиваль на пешеходной улице Жибек Жолы',
        severity: 'low',
        type: 'other',
        status: 'active',
        startTime: new Date(now.getTime() - 3600000),
        endTime: new Date(now.getTime() + 10800000), // 3 hours
        district: 'Almaly',
        locationName: 'Арбат (Жибек Жолы)',
        latitude: '43.2567',
        longitude: '76.9484',
        originalData: { test: true },
      },
      {
        fingerprint: `almaty_test_airport_${now.getTime()}`,
        sourceId: source.id,
        originalId: 'test_airport',
        title: 'Задержка рейсов в аэропорту',
        description: 'Задержка нескольких международных рейсов из-за погодных условий',
        severity: 'high',
        type: 'traffic',
        status: 'active',
        startTime: new Date(now.getTime() - 7200000),
        district: 'Jetysu',
        locationName: 'Международный аэропорт Алматы',
        latitude: '43.3521',
        longitude: '77.0405',
        originalData: { test: true },
      },
      {
        fingerprint: `almaty_test_almaty_tower_${now.getTime()}`,
        sourceId: source.id,
        originalId: 'test_almaty_tower',
        title: 'Вечер в Almaty Tower',
        description: 'Смотровая площадка работает в обычном режиме. Отличная видимость города',
        severity: 'low',
        type: 'other',
        status: 'active',
        startTime: now,
        district: 'Medeu',
        locationName: 'Almaty Tower',
        latitude: '43.2324',
        longitude: '76.9634',
        originalData: { test: true },
      },
      {
        fingerprint: `almaty_test_central_stadium_${now.getTime()}`,
        sourceId: source.id,
        originalId: 'test_central_stadium',
        title: 'Футбольный матч - Центральный стадион',
        description: 'Сегодня футбольный матч в 19:00. Ожидается повышенный трафик',
        severity: 'medium',
        type: 'traffic',
        status: 'active',
        startTime: new Date(now.getTime() + 10800000), // 3 hours from now
        district: 'Medeu',
        locationName: 'Центральный стадион Алматы',
        latitude: '43.2383',
        longitude: '76.9448',
        originalData: { test: true },
      },
    ];

    console.log(`Creating ${testEvents.length} test events...`);

    for (const eventData of testEvents) {
      const [event] = await db.insert(schema.events).values(eventData).returning();
      console.log(`✓ Created: ${event.title} (${event.locationName})`);
    }

    console.log('\n✓ Almaty test events seeded successfully!');
    console.log(`\nTotal events created: ${testEvents.length}`);
    console.log('\nYou can now view these events:');
    console.log('1. Open the map page: http://localhost:3000/map');
    console.log('2. API endpoint: http://localhost:3001/api/v1/map/events');
  } catch (error) {
    console.error('Error seeding Almaty test events:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run seed script
seedAlmatyTestEvents();
