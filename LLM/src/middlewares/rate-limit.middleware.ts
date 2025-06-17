import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cache.service';

const cacheService = new CacheService();

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.body.userId || req.params.userId;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID required for rate limiting'
      });
      return;
    }

    const windowMs = 60000; // 1 minute
    const maxRequests = 20;
    
    const currentCount = await cacheService.incrementRateLimit(`rate_limit:${userId}`, windowMs);

    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - currentCount).toString()
    });

    if (currentCount > maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Maximum ${maxRequests} requests per minute.`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    next(); // Don't block requests if rate limiting fails
  }
};