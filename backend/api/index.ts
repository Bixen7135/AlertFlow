import { serve } from 'bun';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { zValidator } from '@hono/zod-validator';
import { healthCheck as dbHealthCheck, waitForTables } from '../lib/db';
import { healthCheck as redisHealthCheck, getCache, setCache } from '../lib/queue';
import { eventService } from './services/event.service';
import { eventsQuerySchema, eventParamsSchema, mapEventsQuerySchema } from './validators';
import { telegramController } from './telegram.controller';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Health check endpoint
app.get('/health', async (c) => {
  const [dbHealthy, redisHealthy] = await Promise.all([
    dbHealthCheck().catch(() => false),
    redisHealthCheck().catch(() => false),
  ]);

  const isHealthy = dbHealthy && redisHealthy;

  return c.json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks: {
      database: dbHealthy ? 'up' : 'down',
      redis: redisHealthy ? 'up' : 'down',
    },
    timestamp: new Date().toISOString(),
  }, isHealthy ? 200 : 503);
});

// API v1 routes
const apiV1 = new Hono();

// GET /api/v1/events - Feed endpoint with filtering and pagination
apiV1.get(
  '/events',
  zValidator('query', eventsQuerySchema),
  async (c) => {
    const query = c.req.valid('query');
    const { page, limit, type, severity, status, district, startDate, endDate } = query;

    // Try cache first
    const cacheKey = `feed:${JSON.stringify(query)}`;
    const cached = await getCache<typeof eventService.getEvents>(cacheKey);
    if (cached) {
      return c.json(cached);
    }

    // Build filters
    const filters: Parameters<typeof eventService.getEvents>[0] = {};
    if (type) filters.type = type;
    if (severity) filters.severity = severity;
    if (status) filters.status = status;
    if (district) filters.district = district;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    // Fetch from database
    const result = await eventService.getEvents(filters, { page, limit });

    // Cache for 60 seconds
    await setCache(cacheKey, result, 60);

    return c.json(result);
  }
);

// GET /api/v1/events/:id - Event detail with update history
apiV1.get(
  '/events/:id',
  zValidator('param', eventParamsSchema),
  async (c) => {
    const { id } = c.req.valid('param');

    const event = await eventService.getEventById(id);

    if (!event) {
      return c.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Event not found',
          },
        },
        404
      );
    }

    return c.json({ data: event });
  }
);

// GET /api/v1/events/:id/history - Event update history
apiV1.get(
  '/events/:id/history',
  zValidator('param', eventParamsSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');

    // Verify event exists
    const event = await eventService.getEventById(id);
    if (!event) {
      return c.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Event not found',
          },
        },
        404
      );
    }

    const updates = await eventService.getEventUpdates(id, page, limit);

    return c.json({
      data: updates,
      meta: { page, limit },
    });
  }
);

// GET /api/v1/map/events - GeoJSON for map display
apiV1.get(
  '/map/events',
  zValidator('query', mapEventsQuerySchema),
  async (c) => {
    const query = c.req.valid('query');
    const { type, severity } = query;

    // Try cache first
    const cacheKey = `map:${JSON.stringify(query)}`;
    const cached = await getCache<typeof eventService.getEventsForMap>(cacheKey);
    if (cached) {
      return c.json(cached);
    }

    const filters: Parameters<typeof eventService.getEventsForMap>[0] = {};
    if (type) filters.type = type;
    if (severity) filters.severity = severity;

    const result = await eventService.getEventsForMap(filters);

    // Cache for 30 seconds
    await setCache(cacheKey, result, 30);

    return c.json(result);
  }
);

// Mount API v1 routes
app.route('/api/v1', apiV1);

// Mount Telegram webhook routes
app.route('/api/v1/telegram', telegramController);

// 404 handler
app.notFound((c) => {
  return c.json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  }, 404);
});

// Type guard for errors with an errors field
function hasErrorsField(err: unknown): err is { errors: unknown } {
  return typeof err === 'object' && err !== null && 'errors' in err;
}

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const details = hasErrorsField(err) ? err.errors : undefined;
    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details,
        },
      },
      400
    );
  }

  return c.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal error occurred',
      },
    },
    500
  );
});

// Start server
async function startServer() {
  try {
    const port = parseInt(process.env.API_PORT || '3001');
    console.log(`Starting API server on port ${port}...`);

    // Wait for database tables to exist
    console.log('Waiting for database migrations to complete...');
    await waitForTables();

    serve({
      fetch: app.fetch,
      port,
    });

    console.log(`API server listening on http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
  } catch (error) {
    console.error('Failed to start API server:', error);
    process.exit(1);
  }
}

startServer().catch((error) => {
  console.error('API server crashed:', error);
  process.exit(1);
});
