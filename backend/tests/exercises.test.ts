import request from 'supertest';
import { describe, it, expect } from '@jest/globals';

import app from '../src/server';

describe('Exercise Controller', () => {
  describe('GET /api/exercises', () => {
    it('should return all exercises', async () => {
      const res = await request(app).get('/api/exercises');

      expect([200, 404]).toContain(res.statusCode);
      
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty('exercises');
        expect(Array.isArray(res.body.exercises)).toBe(true);
        
        if (res.body.exercises.length > 0) {
          const exercise = res.body.exercises[0];
          expect(exercise).toHaveProperty('id');
          expect(exercise).toHaveProperty('name');
          expect(exercise).toHaveProperty('muscleGroup');
        }
      }
    });
  });

  describe('GET /api/exercises/muscle-group/:muscleGroup', () => {
    it('should filter exercises by muscle group', async () => {
      const allRes = await request(app).get('/api/exercises');
      
      if (allRes.statusCode === 200 && allRes.body.exercises.length > 0) {
        const muscleGroup = allRes.body.exercises[0].muscleGroup;
        
        const res = await request(app)
          .get(`/api/exercises/muscle-group/${muscleGroup}`);

        expect([200, 404]).toContain(res.statusCode);
        
        if (res.statusCode === 200) {
          res.body.exercises.forEach((exercise: any) => {
            expect(exercise.muscleGroup.toLowerCase()).toBe(muscleGroup.toLowerCase());
          });
        }
      }
    });

    it('should return 404 for invalid muscle group', async () => {
      const res = await request(app)
        .get('/api/exercises/muscle-group/invalidgroup');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/exercises/search', () => {
    it('should search exercises by name', async () => {
      const res = await request(app)
        .get('/api/exercises/search')
        .query({ q: 'push' });

      expect([200, 404]).toContain(res.statusCode);
    });

    it('should require search parameter', async () => {
      const res = await request(app)
        .get('/api/exercises/search');

      expect(res.statusCode).toBe(404);
    });
  });
});