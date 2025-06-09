// tests/setup.ts - Test Setup and Database Initialization
import { Pool, PoolClient } from 'pg';

// Global test database pool
let testPool: Pool;

// Setup before all tests
beforeAll(async () => {
  try {
    console.log('🔧 Setting up test database connection...');
    
    // Create database pool with your Docker configuration
    testPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433'),
      database: process.env.DB_NAME || 'coachgpt_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Test database connection
    const client: PoolClient = await testPool.connect();
    console.log('✅ Database connection successful');
    
    // Verify tables exist (they should from your setup)
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableNames = tablesResult.rows.map(row => row.table_name);
    console.log('📋 Available tables:', tableNames);
    
    // Verify sample data exists
    const exerciseCount = await client.query('SELECT COUNT(*) FROM exercises');
    console.log('💪 Sample exercises available:', exerciseCount.rows[0].count);
    
    client.release();
    console.log('✅ Test database setup complete');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
});

// Cleanup before each test
beforeEach(async () => {
  if (testPool) {
    try {
      // Clean up test data but keep sample exercises
      await testPool.query('DELETE FROM workout_plans');
      await testPool.query('DELETE FROM users');
      // Reset auto-increment sequences
      await testPool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
      await testPool.query('ALTER SEQUENCE workout_plans_id_seq RESTART WITH 1');
    } catch (err: any) {
      console.error('⚠️ Cleanup warning:', err.message);
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (testPool) {
    try {
      await testPool.end();
      console.log('🔒 Database connection closed');
    } catch (err: any) {
      console.error('⚠️ Error closing database:', err.message);
    }
  }
});

// Export pool for use in tests
export { testPool };