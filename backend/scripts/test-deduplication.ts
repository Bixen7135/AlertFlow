/**
 * Test script for deduplication and change detection
 */

import { eq } from 'drizzle-orm';
import { getDb, schema } from '../lib/db';
import { computeFingerprint, hasMeaningfulChange, extractChangedFields } from '../shared/event-types';
import type { NormalizedEvent } from '../shared/event-types';

async function testDeduplication() {
  const db = getDb();

  console.log('Testing deduplication...\n');

  // Create a test event
  const testEvent: NormalizedEvent = {
    sourceId: 'test-source',
    originalId: 'test-001',
    title: 'Test Alert',
    description: 'This is a test alert for deduplication',
    severity: 'high',
    type: 'weather',
    status: 'active',
    startTime: new Date(),
    district: 'downtown',
    originalData: { test: true },
  };

  const fingerprint1 = computeFingerprint(testEvent);
  console.log(`Fingerprint 1: ${fingerprint1}`);

  // Simulate inserting the event
  console.log('\n1. Simulating first insert...');
  await db.insert(schema.events).values({
    fingerprint: fingerprint1,
    sourceId: testEvent.sourceId,
    originalId: testEvent.originalId,
    title: testEvent.title,
    description: testEvent.description,
    severity: testEvent.severity,
    type: testEvent.type,
    status: testEvent.status,
    startTime: testEvent.startTime,
    originalData: testEvent.originalData,
  });
  console.log('   ✓ Event inserted');

  // Try to insert again (should trigger upsert instead)
  console.log('\n2. Simulating duplicate insert...');
  const existing = await db.query.events.findFirst({
    where: eq(schema.events.fingerprint, fingerprint1),
  });

  if (existing) {
    console.log('   ✓ Duplicate detected (fingerprint match)');
    console.log(`   Existing ID: ${existing.id}`);

    // Test meaningful change detection
    console.log('\n3. Testing change detection...');

    const updatedEvent: NormalizedEvent = {
      ...testEvent,
      severity: 'critical', // Changed from 'high'
    };

    const meaningfulChange = hasMeaningfulChange(existing, updatedEvent);
    console.log(`   Meaningful change detected: ${meaningfulChange}`);

    const changedFields = extractChangedFields(existing, updatedEvent);
    console.log(`   Changed fields: ${changedFields.join(', ')}`);
  }

  // Cleanup
  console.log('\n4. Cleaning up test data...');
  await db.delete(schema.events).where(eq(schema.events.sourceId, 'test-source'));
  console.log('   ✓ Test data cleaned up');

  console.log('\n✓ Deduplication test complete!');
}

// Run if called directly
if (import.meta.main) {
  testDeduplication().catch(console.error);
}

export { testDeduplication };
