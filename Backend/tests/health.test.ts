import request from 'supertest';
import app from '../src/server';

describe('Health Controller', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should respond quickly', async () => {
      const startTime = Date.now();
      const res = await request(app).get('/health');
      const responseTime = Date.now() - startTime;
      
      expect(res.statusCode).toBe(200);
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('GET /health - detailed info', () => {
    it('should return detailed health with database info', async () => {
      const res = await request(app).get('/health');

      expect([200, 503]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('database');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('environment');
    });

    it('should check database connectivity', async () => {
      const res = await request(app).get('/health');

      expect([200, 503]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('database');
      // If healthy, database should be 'connected'
      if (res.statusCode === 200) {
        expect(res.body.database).toBe('connected');
      }
    });
  });

  describe('GET /ready', () => {
    it('should return readiness status', async () => {
      const res = await request(app).get('/ready');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ready');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /live', () => {
    it('should return liveness status', async () => {
      const res = await request(app).get('/live');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'alive');
      expect(res.body).toHaveProperty('timestamp');
    });
  });
});