import { createClient, RedisClientType } from 'redis';

export class CacheService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
      this.isConnected = false;
    });

    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Redis connection failed:', error);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      await this.client.del(key);
      return true;
    } catch {
      return false;
    }
  }

  async checkHealth(): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
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
    } catch {
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