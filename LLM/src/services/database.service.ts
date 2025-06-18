import { Pool, PoolClient } from 'pg';

export class DatabaseService {
  private pool: Pool;
  private healthCheckCache: { healthy: boolean; lastCheck: number } = { healthy: false, lastCheck: 0 };
  private readonly CACHE_TTL = 5000; // 5 seconds cache

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'coachgpt',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });

    this.initializeTables();
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const results = await this.query<T>(text, params);
    return results.length > 0 ? results[0] : null;
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if recent
    if (now - this.healthCheckCache.lastCheck < this.CACHE_TTL) {
      return this.healthCheckCache.healthy;
    }

    try {
      console.log('🔍 Checking database health...');
      
      // Test with a simple query and timeout
      const result = await Promise.race([
        this.query('SELECT 1 as test'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database health check timeout')), 3000)
        )
      ]) as any[];

      const healthy = result.length > 0 && result[0].test === 1;
      
      if (healthy) {
        console.log('✅ Database health check passed');
      } else {
        console.error('❌ Database health check failed: unexpected result');
      }

      this.healthCheckCache = { healthy, lastCheck: now };
      return healthy;
      
    } catch (error: any) {
      console.error('❌ Database health check failed:', error.message);
      this.healthCheckCache = { healthy: false, lastCheck: now };
      return false;
    }
  }

  private async initializeTables() {
    try {
      await this.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      await this.query(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID PRIMARY KEY,
          conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          role VARCHAR(20) NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      await this.query(`
        CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
      `);

      console.log('✅ Database tables initialized');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
    }
  }
}