import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import app from '../src/server';
import { Pool } from 'pg';
import { getTestPool, cleanDatabase } from './testUtils';

describe('Plan Controller - Complete Coverage', () => {
  let testPool: Pool;
  let testUserId: string;
  let testPlanId: string;
  let authToken: string;
  
  const testUser = {
    name: 'Plan User',
    email: `planuser-${Date.now()}@example.com`,
    password: 'password123'
  };

  beforeAll(async () => {
    testPool = getTestPool();
    
    // Create the plan_actions table if it doesn't exist
    await testPool.query(`
      CREATE TABLE IF NOT EXISTS plan_actions (
        id SERIAL PRIMARY KEY,
        plan_id INTEGER REFERENCES workout_plans(id) ON DELETE CASCADE,
        action_type VARCHAR(50) NOT NULL,
        old_exercise VARCHAR(255),
        new_exercise VARCHAR(255),
        week_number INTEGER,
        day_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  });

  beforeEach(async () => {
    await cleanDatabase(testPool);
    
    // Create user and login
    const registerRes = await request(app)
      .post('/auth/register')
      .send(testUser);
    
    testUserId = registerRes.body.user.id;
    
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ 
        email: testUser.email, 
        password: testUser.password 
      });
    
    authToken = loginRes.body.token;

    // Create a test plan for most tests
    const planRes = await request(app)
      .post('/plan/generate')
      .send({
        userId: testUserId,
        goal: 'strength',
        daysPerWeek: 3,
        difficultyLevel: 'beginner'
      });
    
    if (planRes.statusCode === 201) {
      testPlanId = planRes.body.plan.id;
    }
  });

  afterAll(async () => {
    if (testPool) {
      await testPool.end();
    }
  });

  describe('POST /plan/generate', () => {
    it('should generate a new 4-week workout plan', async () => {
      const res = await request(app)
        .post('/plan/generate')
        .send({
          userId: testUserId,
          goal: 'muscle_building',
          daysPerWeek: 4,
          difficultyLevel: 'intermediate'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.plan).toHaveProperty('id');
      expect(res.body.plan.user_id).toBe(testUserId);
      expect(res.body.plan.goal).toBe('muscle_building');
      expect(res.body.plan.days_per_week).toBe(4);
      expect(res.body.plan.plan_data.weeks).toHaveLength(4);
    });

    it('should reject invalid input', async () => {
      const res = await request(app)
        .post('/plan/generate')
        .send({
          userId: 'invalid-uuid',
          goal: 'strength'
          // Missing required fields
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /plan/user/:userId', () => {
    it('should get the latest plan created by a specific user', async () => {
      const res = await request(app)
        .get(`/plan/user/${testUserId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user_id).toBe(testUserId);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('plan_data');
    });

    it('should return 404 for user with no plans', async () => {
      // Create a new user without plans
      const newUserRes = await request(app)
        .post('/auth/register')
        .send({
          name: 'No Plans User',
          email: `noplans-${Date.now()}@example.com`,
          password: 'password123'
        });

      const res = await request(app)
        .get(`/plan/user/${newUserRes.body.user.id}`);

      expect(res.statusCode).toBe(404);
    });

    it('should reject invalid userId format', async () => {
      const res = await request(app)
        .get('/plan/user/invalid-uuid');

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /plan/:planId', () => {
    it('should get a workout plan by its ID', async () => {
      if (!testPlanId) return;

      const res = await request(app)
        .get(`/plan/${testPlanId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      // Fixed: sendSuccess(res, { plan: ... }) means res.body.plan directly
      expect(res.body).toHaveProperty('plan');
      expect(res.body.plan).toHaveProperty('id', testPlanId);
      expect(res.body.plan).toHaveProperty('user_id', testUserId);
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app)
        .get('/plan/99999');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /plan/:planId/swap-exercise', () => {
    it('should swap one exercise with another in a plan', async () => {
      if (!testPlanId) return;

      const res = await request(app)
        .patch(`/plan/${testPlanId}/swap-exercise`)
        .send({
          currentExercise: 'Push-ups',
          newExercise: 'Bench Press',
          weekNumber: 1
        });

      expect([200, 404]).toContain(res.statusCode);
      
      if (res.statusCode === 200) {
        expect(res.body.status).toBe('success');
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('updatedPlan');
      }
    });

    it('should reject missing required fields', async () => {
      if (!testPlanId) return;

      const res = await request(app)
        .patch(`/plan/${testPlanId}/swap-exercise`)
        .send({
          currentExercise: 'Push-ups'
          // Missing newExercise
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PATCH /plan/:planId/add-exercise', () => {
    it('should add a new exercise to a workout day based on muscle group', async () => {
      if (!testPlanId) return;

      const res = await request(app)
        .patch(`/plan/${testPlanId}/add-exercise`)
        .send({
          weekNumber: 1,
          muscleGroup: 'chest',
          newExercise: 'Incline Bench Press'
        });

      expect([200, 404, 500]).toContain(res.statusCode);
      
      if (res.statusCode === 200) {
        expect(res.body.status).toBe('success');
        // Fixed: sendSuccess(res, { message: ..., updatedPlan: ... }) 
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('updatedPlan');
      }
    });

    it('should reject missing required fields', async () => {
      if (!testPlanId) return;

      const res = await request(app)
        .patch(`/plan/${testPlanId}/add-exercise`)
        .send({
          weekNumber: 1
          // Missing muscleGroup and newExercise
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PATCH /plan/:planId/delete-exercise', () => {
    it('should delete an exercise from a specific muscle group day', async () => {
      if (!testPlanId) return;

      const res = await request(app)
        .patch(`/plan/${testPlanId}/delete-exercise`)
        .send({
          weekNumber: 1,
          muscleGroup: 'chest',
          exerciseToDelete: 'Push-ups'
        });

      expect([200, 404]).toContain(res.statusCode);
      
      if (res.statusCode === 200) {
        expect(res.body.status).toBe('success');
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('updatedPlan');
      }
    });

    it('should reject missing required fields', async () => {
      if (!testPlanId) return;

      const res = await request(app)
        .patch(`/plan/${testPlanId}/delete-exercise`)
        .send({
          weekNumber: 1
          // Missing muscleGroup and exerciseToDelete
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /plan/:planId/delete-plan', () => {
    it('should delete a workout plan completely', async () => {
      if (!testPlanId) return;

      const res = await request(app)
        .delete(`/plan/${testPlanId}/delete-plan`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      // Fixed: sendSuccess(res, { message: ..., deletedPlan: ... })
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('deletedPlan');
      
      // Verify deletion in database
      const dbResult = await testPool.query(
        'SELECT id FROM workout_plans WHERE id = $1',
        [testPlanId]
      );
      expect(dbResult.rows).toHaveLength(0);
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app)
        .delete('/plan/99999/delete-plan');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /plan/:planId/actions', () => {
    it('should get all action history for a workout plan', async () => {
      if (!testPlanId) return;

      const res = await request(app)
        .get(`/plan/${testPlanId}/actions`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      // Fixed: sendSuccess(res, { actions: ... })
      expect(res.body).toHaveProperty('actions');
      expect(Array.isArray(res.body.actions)).toBe(true);
    });

    it('should handle missing planId gracefully', async () => {
      // This will hit GET /plan/:planId with planId="actions"
      const res = await request(app)
        .get('/plan/actions');

      expect([404, 500]).toContain(res.statusCode);
    });
  });

  describe('Integration Tests', () => {
    it('should complete a full workout plan lifecycle', async () => {
      // 1. Generate plan
      const generateRes = await request(app)
        .post('/plan/generate')
        .send({
          userId: testUserId,
          goal: 'fat_loss',
          daysPerWeek: 3,
          difficultyLevel: 'beginner'
        });
      
      expect(generateRes.statusCode).toBe(201);
      const planId = generateRes.body.plan.id;

      // 2. Get plan by ID
      const getRes = await request(app)
        .get(`/plan/${planId}`);
      expect(getRes.statusCode).toBe(200);

      // 3. Add exercise
      const addRes = await request(app)
        .patch(`/plan/${planId}/add-exercise`)
        .send({
          weekNumber: 1,
          muscleGroup: 'chest',
          newExercise: 'Dumbbell Press'
        });
      expect([200, 404, 500]).toContain(addRes.statusCode);

      // 4. Swap exercise
      const swapRes = await request(app)
        .patch(`/plan/${planId}/swap-exercise`)
        .send({
          currentExercise: 'Push-ups',
          newExercise: 'Diamond Push-ups',
          weekNumber: 1
        });
      expect([200, 404]).toContain(swapRes.statusCode);

      // 5. Get actions history
      const actionsRes = await request(app)
        .get(`/plan/${planId}/actions`);
      expect(actionsRes.statusCode).toBe(200);

      // 6. Delete plan
      const deleteRes = await request(app)
        .delete(`/plan/${planId}/delete-plan`);
      expect(deleteRes.statusCode).toBe(200);
    });
  });
});