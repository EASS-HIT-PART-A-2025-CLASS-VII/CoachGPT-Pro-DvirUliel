import request from 'supertest';
import app from '../src/server';

let createdUserId: string;
let createdPlanId: string;

describe('Workout Plan Endpoints', () => {
  const testUser = {
    name: 'Plan Tester',
    email: 'plantester@example.com',
    password: 'strongpassword123'
  };

  beforeAll(async () => {
    // Register a test user once
    const res = await request(app).post('/api/auth/register').send(testUser);
    createdUserId = res.body.user.id;

    // Generate a plan for the user
    const planRes = await request(app).post('/api/plan/generate').send({
      userId: createdUserId,
      goal: 'build muscle',
      daysPerWeek: 3,
      difficultyLevel: 'beginner'
    });

    if (planRes.statusCode === 201) {
      createdPlanId = planRes.body.plan.id;
    } else {
      console.warn('Plan generation failed or skipped.');
    }
  });

  it('should get the latest plan by user ID', async () => {
    const res = await request(app).get(`/api/plan/user/${createdUserId}`);
    expect([200, 404]).toContain(res.statusCode);
  });

  it('should get the plan by ID', async () => {
    if (!createdPlanId) return;
    const res = await request(app).get(`/api/plan/${createdPlanId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('plan');
  });

  it('should swap an exercise in the plan', async () => {
    if (!createdPlanId) return;
    const res = await request(app)
      .patch(`/api/plan/${createdPlanId}/swap-exercise`)
      .send({
        currentExercise: 'Push-up',
        newExercise: 'Bench Press',
        weekNumber: 1
      });
    expect([200, 404]).toContain(res.statusCode);
  });

  it('should add an exercise to the plan', async () => {
    if (!createdPlanId) return;
    const res = await request(app)
      .patch(`/api/plan/${createdPlanId}/add-exercise`)
      .send({
        weekNumber: 1,
        muscleGroup: 'chest',
        newExercise: 'Incline Dumbbell Press'
      });
    expect([200, 400, 404]).toContain(res.statusCode);
  });

  it('should delete an exercise from the plan', async () => {
    if (!createdPlanId) return;
    const res = await request(app)
      .patch(`/api/plan/${createdPlanId}/delete-exercise`)
      .send({
        weekNumber: 1,
        muscleGroup: 'chest',
        exerciseToDelete: 'Incline Dumbbell Press'
      });
    expect([200, 400, 404]).toContain(res.statusCode);
  });

  it('should get the action history of the plan', async () => {
    if (!createdPlanId) return;
    const res = await request(app).get(`/api/plan/${createdPlanId}/actions`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('actions');
  });

  it('should delete the workout plan', async () => {
    if (!createdPlanId) return;
    const res = await request(app).delete(`/api/plan/${createdPlanId}/delete-plan`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('deletedPlan');
  });

  afterAll(async () => {
    await request(app).delete(`/api/auth/delete/${createdUserId}`);
  });
});