import { describe, test, expect, beforeAll, afterAll } from 'bun:test';

describe('API Endpoints', () => {
  let baseUrl: string;
  let server: any;

  beforeAll(() => {
    baseUrl = process.env.API_URL || 'http://localhost:3001';
  });

  afterAll(() => {
    // Cleanup
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await fetch(`${baseUrl}/health`);
      const data = await response.json();

      expect(response.status).toBeOneOf([200, 503]);
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('checks');
      expect(data.checks).toHaveProperty('database');
      expect(data.checks).toHaveProperty('redis');
      expect(data).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1/events', () => {
    test('should return paginated events list', async () => {
      const response = await fetch(`${baseUrl}/api/v1/events?page=1&limit=10`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(data.data).toBeInstanceOf(Array);
      expect(data.meta).toHaveProperty('total');
      expect(data.meta).toHaveProperty('page');
      expect(data.meta).toHaveProperty('limit');
    });

    test('should filter by type query param', async () => {
      const response = await fetch(`${baseUrl}/api/v1/events?type=weather`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeInstanceOf(Array);
    });

    test('should filter by severity query param', async () => {
      const response = await fetch(`${baseUrl}/api/v1/events?severity=high`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeInstanceOf(Array);
    });

    test('should return validation error for invalid limit', async () => {
      const response = await fetch(`${baseUrl}/api/v1/events?limit=999`);
      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/v1/events/:id', () => {
    test('should return 404 for non-existent event', async () => {
      const response = await fetch(`${baseUrl}/api/v1/events/00000000-0000-0000-0000-000000000000`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toHaveProperty('code');
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/v1/map/events', () => {
    test('should return GeoJSON FeatureCollection', async () => {
      const response = await fetch(`${baseUrl}/api/v1/map/events`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.type).toBe('FeatureCollection');
      expect(data.features).toBeInstanceOf(Array);
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await fetch(`${baseUrl}/api/v1/unknown`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toHaveProperty('code');
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });
});
