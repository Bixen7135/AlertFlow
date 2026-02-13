import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

let client: postgres.Sql | null = null;
let db: DbInstance | null = null;

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return url;
}

export function getConnection() {
  if (!client) {
    const url = getDatabaseUrl();
    client = postgres(url, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return client;
}

export function getDb() {
  if (!db) {
    const connection = getConnection();
    db = drizzle(connection, { schema });
  }
  return db;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const connection = getConnection();
    await connection`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if required tables exist in the database
 * This is used to ensure migrations have completed before workers start
 */
export async function tablesExist(): Promise<boolean> {
  try {
    const connection = getConnection();
    const result = await connection`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'sources'
      ) as exists
    `;
    return result[0]?.exists === true;
  } catch {
    return false;
  }
}

/**
 * Wait for tables to exist with retries
 * Throws an error if tables don't exist after max retries
 */
export async function waitForTables(maxRetries = 30, retryInterval = 2000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    const exists = await tablesExist();
    if (exists) {
      console.log('Database tables verified.');
      return;
    }

    if (i < maxRetries - 1) {
      console.log(`Tables not found, retrying in ${retryInterval / 1000}s... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }

  throw new Error('Database tables not found after maximum retries. Migrations may have failed.');
}

export { schema };
