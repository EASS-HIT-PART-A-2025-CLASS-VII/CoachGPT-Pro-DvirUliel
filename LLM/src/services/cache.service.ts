import { createClient, RedisClientType } from 'redis';

export class CacheService {
  private client: RedisClientType;
  private isConnected: boolean = false;
  private healthCheckCache: { healthy: boolean; lastCheck: number } = { healthy: false, lastCheck: 0 };
  private readonly CACHE_TTL = 5000; // 5 seconds cache

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        connectTimeout: 3000
      }
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
      this.isConnected = false;
    });

    this.client.on('disconnect', () => {
      console.log('⚠️  Redis disconnected');
      this.isConnected = false;
    });

    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
    } catch (error: any) {
      console.error('❌ Redis connection failed:', error.message);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error: any) {
      console.error('Redis get error:', error.message);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error: any) {
      console.error('Redis set error:', error.message);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error: any) {
      console.error('Redis del error:', error.message);
      return false;
    }
  }

  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if recent
    if (now - this.healthCheckCache.lastCheck < this.CACHE_TTL) {
      return this.healthCheckCache.healthy;
    }

    if (!this.isConnected) {
      this.healthCheckCache = { healthy: false, lastCheck: now };
      return false;
    }

    try {
      console.log('🔍 Checking Redis health...');
      
      // Test with timeout
      const result = await Promise.race([
        this.client.ping(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis health check timeout')), 3000)
        )
      ]) as string;

      const healthy = result === 'PONG';
      
      if (healthy) {
        console.log('✅ Redis health check passed');
      } else {
        console.error('❌ Redis health check failed: unexpected ping result');
      }

      this.healthCheckCache = { healthy, lastCheck: now };
      return healthy;
      
    } catch (error: any) {
      console.error('❌ Redis health check failed:', error.message);
      this.healthCheckCache = { healthy: false, lastCheck: now };
      return false;
    }
  }

  async incrementRateLimit(key: string, windowMs: number): Promise<number> {
    if (!this.isConnected) return 1;
    try {
      const current = await this.client.incr(key);
      if (current === 1) {
        await this.client.pExpire(key, windowMs);
      }
      return current;
    } catch (error: any) {
      console.error('Redis rate limit error:', error.message);
      return 1;
    }
  }

  async setUserContext(userId: string, context: any): Promise<boolean> {
    return this.set(`user_context:${userId}`, context, 3600);
  }

  async getUserContext(userId: string): Promise<any | null> {
    return this.get(`user_context:${userId}`);
  }
}