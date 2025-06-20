// tests/testUtils.ts - Test Utilities (Clean Version - No Type Issues)
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Database connection
export const getTestPool = (): Pool => {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    database: process.env.DB_NAME || 'coachgpt_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
};

// Test user interface
export interface TestUser {
  username: string;
  email: string;
  password: string;
}

// Database user interface
export interface DbUser {
  id: number;
  username: string;
  email: string;
  created_at?: Date;
}

// Test user data
export const testUsers = {
  user1: {
    username: 'testuser1',
    email: 'test1@example.com',
    password: 'password123'
  } as TestUser,
  user2: {
    username: 'testuser2',
    email: 'test2@example.com',
    password: 'password456'
  } as TestUser
};

// Create test user in database
export const createTestUser = async (pool: Pool, userData: TestUser = testUsers.user1): Promise<DbUser> => {
  const hashedPassword = await bcrypt.hash(userData.password, 4);
  
  const result = await pool.query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
    [userData.username, userData.email, hashedPassword]
  );
  
  return result.rows[0];
};

// Generate test JWT token - SIMPLIFIED TO AVOID TYPE ISSUES
export const generateTestToken = (userId: number): string => {
  const payload = { userId };
  const secret = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
  const expiresIn = '1h'; // Fixed value to avoid type issues
  
  return jwt.sign(payload, secret, { expiresIn });
};

// Exercise interface
export interface Exercise {
  id: number;
  name: string;
  sets?: number;
  reps?: number;
  duration?: number | null;
}

// Sample workout plan
export const sampleWorkoutPlan = {
  name: 'Test Workout Plan',
  description: 'A test workout plan for unit testing',
  exercises: [
    {
      id: 1,
      name: 'Push-ups',
      sets: 3,
      reps: 10,
      duration: null
    },
    {
      id: 2,
      name: 'Squats',
      sets: 3,
      reps: 15,
      duration: null
    }
  ] as Exercise[]
};

// Clean database utility - FIXED for UUID primary keys
export const cleanDatabase = async (pool: Pool): Promise<void> => {
  await pool.query('DELETE FROM workout_plans');
  await pool.query('DELETE FROM users');
  
  // Only restart sequences that actually exist
  try {
    await pool.query('ALTER SEQUENCE workout_plans_id_seq RESTART WITH 1');
  } catch (e) {
    // Sequence doesn't exist, that's OK
  }
  
  // Don't try to restart users_id_seq since users table uses UUID primary key
};

// Wait utility for async operations
export const waitFor = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate test user data
export const generateTestUser = (suffix: string = ''): TestUser => ({
  username: `testuser${suffix}`,
  email: `test${suffix}@example.com`,
  password: 'password123'
});

// Verify JWT token - SIMPLIFIED
export const verifyTestToken = (token: string) => {
  const secret = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
  return jwt.verify(token, secret);
};