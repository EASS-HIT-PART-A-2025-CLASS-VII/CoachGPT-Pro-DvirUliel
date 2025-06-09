// tests/env-setup.js - Final Environment Setup Fix
const path = require('path');
const dotenv = require('dotenv');

// Load test environment variables
const envPath = path.resolve(__dirname, '../.env.test');
console.log('Loading test environment from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('Warning: Could not load .env.test file:', result.error.message);
} else {
  console.log('✅ Test environment loaded successfully');
}

// FORCE set the correct database credentials (override any existing values)
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5433';
process.env.DB_NAME = 'coachgpt_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'password';  // FORCE the correct password
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_ROUNDS = '4';
process.env.LOG_LEVEL = 'error';

console.log('✅ Test environment configured:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? `***${process.env.DB_PASSWORD}***` : 'NOT SET',
  JWT_SECRET: '***SET***'
});

// Verify the password is actually set
if (!process.env.DB_PASSWORD) {
  console.error('❌ DB_PASSWORD is still not set!');
  process.exit(1);
} else {
  console.log('✅ DB_PASSWORD confirmed set');
}