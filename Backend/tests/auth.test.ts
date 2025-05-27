import request from 'supertest';
import app from '../src/server';

let createdUserId: string;

describe('Auth Endpoints', () => {
  const userData = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'testpass'
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    console.log('[REGISTER RESPONSE]', res.statusCode, res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    createdUserId = res.body.user.id;
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password });

    console.log('[LOGIN RESPONSE]', res.statusCode, res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should delete the user', async () => {
    const res = await request(app).delete(`/api/auth/delete/${createdUserId}`);

    console.log('[DELETE RESPONSE]', res.statusCode, res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});