import Redis from 'ioredis';
import { Queue, Worker, Job } from 'bullmq';

// Job types
export interface TelegramDeliveryJob {
  eventId: string;
  eventType: string;
  severity: string;
  title: string;
}

export interface JobOptions {
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
}

let redisClient: Redis | null = null;
let telegramQueue: Queue<TelegramDeliveryJob> | null = null;

export function getRedisUrl(): string {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('REDIS_URL environment variable is not set');
  }
  return url;
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    const url = getRedisUrl();
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
  }
  return redisClient;
}

export function getTelegramQueue(): Queue<TelegramDeliveryJob> {
  if (!telegramQueue) {
    const connection = {
      host: new URL(getRedisUrl()).hostname,
      port: parseInt(new URL(getRedisUrl()).port) || 6379,
    };

    telegramQueue = new Queue<TelegramDeliveryJob>('telegram-deliveries', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });
  }
  return telegramQueue;
}

export async function closeQueue(): Promise<void> {
  if (telegramQueue) {
    await telegramQueue.close();
    telegramQueue = null;
  }
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch {
    return false;
  }
}

// Cache helpers
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number = 60): Promise<void> {
  try {
    const client = getRedisClient();
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (error) {
    console.error('Failed to set cache:', error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error('Failed to delete cache:', error);
  }
}

// Rate limiting helpers
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const client = getRedisClient();
  const key = `ratelimit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  // Remove old entries
  await client.zremrangebyscore(key, 0, windowStart);

  // Count current requests
  const count = await client.zcard(key);

  if (count >= limit) {
    const oldest = await client.zrange(key, 0, 0);
    const resetAt = oldest.length > 0 ? parseInt(oldest[0]) + windowSeconds : now + windowSeconds;
    return { allowed: false, remaining: 0, resetAt };
  }

  // Add current request
  await client.zadd(key, now, now.toString());
  await client.expire(key, windowSeconds);

  return { allowed: true, remaining: limit - count - 1, resetAt: now + windowSeconds };
}
