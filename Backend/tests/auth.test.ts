import request from 'supertest';
import app from '../src/server';
import { Pool } from 'pg';
import { getTestPool, cleanDatabase } from './testUtils';

describe('Auth Controller', () => {
  let testPool: Pool;

  beforeAll(async () => {
    testPool = getTestPool();
  });

  beforeEach(async () => {
    await cleanDatabase(testPool);
  });

  afterAll(async () => {
    if (testPool) {
      await testPool.end();
    }
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',        // Your controller uses 'name'
        email: 'test@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/auth/register')   // Fixed URL path
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('name', userData.name);
      expect(res.body.user).toHaveProperty('email', userData.email);
      expect(res.body.user).not.toHaveProperty('password'); // Should not return password
    });

    it('should reject duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      // Register first user
      await request(app)
        .post('/auth/register')
        .send(userData);

      // Try to register same email again
      const res = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toContain('already in use');
    });

    it('should reject invalid data', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: '',  // Missing name
          email: 'invalid-email',  // Invalid email
          password: ''  // Missing password
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Missing required fields');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'login@example.com',
          password: 'password123'
        });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('email', 'login@example.com');
      expect(typeof res.body.token).toBe('string');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toContain('Invalid email or password');
    });
  });

  describe('DELETE /auth/delete/:userId', () => {
    let userId: string;

    beforeEach(async () => {
      // Create a test user to delete
      const registerRes = await request(app)
        .post('/auth/register')
        .send({
          name: 'Delete Test User',
          email: 'delete@example.com',
          password: 'password123'
        });
      
      userId = registerRes.body.user.id;
    });

    it('should delete user', async () => {
      const res = await request(app)
        .delete(`/auth/delete/${userId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('deleted successfully');
      expect(res.body.deletedUser).toHaveProperty('id', userId);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeUserId = '123e4567-e89b-12d3-a456-426614174000'; // Valid UUID format
      
      const res = await request(app)
        .delete(`/auth/delete/${fakeUserId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toContain('User not found');
    });
  });
});