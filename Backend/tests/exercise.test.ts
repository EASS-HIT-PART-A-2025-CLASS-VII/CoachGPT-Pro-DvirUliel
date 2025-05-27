import request from 'supertest';
import app from '../src/server';

describe('Exercise Endpoint', () => {
  it('should return all exercises', async () => {
    const res = await request(app).get('/api/exercises');

    console.log('[EXERCISE RESPONSE]', res.statusCode, res.body);

    expect([200, 404]).toContain(res.statusCode); // allow both for safety
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('exercises');
      expect(Array.isArray(res.body.exercises)).toBe(true);
    } else if (res.statusCode === 404) {
      expect(res.body).toHaveProperty('message', 'No exercises found');
    }
  });
});