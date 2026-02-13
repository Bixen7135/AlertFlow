import { getDatabaseUrl } from '../lib/db';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

const MIGRATION_LOCK_ID = 123456; // Arbitrary lock ID for migrations

async function runMigration() {
  const url = getDatabaseUrl();
  const sql = postgres(url);

  try {
    console.log('Acquiring migration lock...');

    // Try to acquire an advisory lock (non-blocking)
    const lockResult = await sql`SELECT pg_try_advisory_lock(${MIGRATION_LOCK_ID}) as acquired`;

    if (!lockResult[0]?.acquired) {
      console.log('Another migration is already running. Waiting...');
      // If we can't get the lock, wait for it (blocking)
      await sql`SELECT pg_advisory_lock(${MIGRATION_LOCK_ID})`;
      console.log('Lock acquired after waiting.');
    } else {
      console.log('Migration lock acquired.');
    }

    // Check if tables already exist
    const tablesExist = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'sources'
      ) as exists
    `;

    if (tablesExist[0]?.exists) {
      console.log('Tables already exist. Skipping migration.');
      return;
    }

    console.log('Running migrations...');

    const migrationPath = join(process.cwd(), 'migrations', '001_initial.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    await sql.unsafe(migrationSQL);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Release the advisory lock
    try {
      await sql`SELECT pg_advisory_unlock(${MIGRATION_LOCK_ID})`;
      console.log('Migration lock released.');
    } catch (unlockError) {
      console.warn('Failed to release migration lock:', unlockError);
    }
    await sql.end();
  }
}

// Run if called directly
if (import.meta.main) {
  runMigration().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

export { runMigration };
