import { getDb, schema } from '../lib/db';
import type { NewEvent } from '../shared/schema';

async function seedDatabase() {
  const db = getDb();

  try {
    console.log('Seeding database...');

    // Clear existing data
    await db.delete(schema.eventUpdates);
    await db.delete(schema.events);
    await db.delete(schema.ingestionLogs);
    await db.delete(schema.telegramSubscriptions);
    await db.delete(schema.sources);

    // Insert test source
    const [source] = await db.insert(schema.sources).values({
      name: 'Test City Alerts',
      type: 'rss',
      url: 'https://example.com/alerts.xml',
      pollingIntervalSeconds: 300,
      enabled: true,
    }).returning();

    console.log('Created source:', source.id);

    // Insert test events
    const now = new Date();
    const testEvents: Omit<NewEvent, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        fingerprint: `fp_${source.id}_evt1_${now.getTime()}`,
        sourceId: source.id,
        originalId: 'evt1',
        title: 'Heavy Rain Expected',
        description: 'Heavy rainfall expected in the downtown area. Potential for localized flooding.',
        severity: 'high',
        type: 'weather',
        status: 'active',
        startTime: new Date(now.getTime() + 3600000), // 1 hour from now
        district: 'downtown',
        locationName: 'Downtown Core',
        originalData: { alertId: 'evt1' },
      },
      {
        fingerprint: `fp_${source.id}_evt2_${now.getTime() - 3600000}`,
        sourceId: source.id,
        originalId: 'evt2',
        title: 'Road Closure - Main Street',
        description: 'Main Street closed between 5th and 6th Avenue due to construction.',
        severity: 'medium',
        type: 'traffic',
        status: 'active',
        startTime: new Date(now.getTime() - 3600000), // Started 1 hour ago
        district: 'downtown',
        locationName: 'Main Street',
        originalData: { alertId: 'evt2' },
      },
      {
        fingerprint: `fp_${source.id}_evt3_${now.getTime() - 86400000}`,
        sourceId: source.id,
        originalId: 'evt3',
        title: 'Water Main Repair Complete',
        description: 'The water main repair on Oak Street has been completed.',
        severity: 'low',
        type: 'utility',
        status: 'resolved',
        startTime: new Date(now.getTime() - 90000000), // Started 25 hours ago
        endTime: new Date(now.getTime() - 86400000), // Resolved 24 hours ago
        district: 'oak_hill',
        locationName: 'Oak Street',
        originalData: { alertId: 'evt3' },
      },
    ];

    for (const eventData of testEvents) {
      const [event] = await db.insert(schema.events).values(eventData).returning();
      console.log('Created event:', event.id);
    }

    // Insert test subscription
    const [subscription] = await db.insert(schema.telegramSubscriptions).values({
      telegramUserId: '123456789',
      telegramChatId: '123456789',
      eventTypesFilter: ['*'],
      districtFilter: '*',
    }).returning();

    console.log('Created subscription:', subscription.id);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.main) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };
