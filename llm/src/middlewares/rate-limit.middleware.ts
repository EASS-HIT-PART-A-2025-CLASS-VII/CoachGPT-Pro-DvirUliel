import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiting (resets on service restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Limits each user to 10 requests per minute
 * Tracks requests in memory (resets on restart)
 * Adds rate limit headers to responses
 * Cleans up expired entries every 5 minutes
 */
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
    const maxRequests = 10; // Reduced for local LLM
    const now = Date.now();
    
    // Clean up expired entries
    cleanupExpiredEntries(now);
    
    const userKey = `rate_limit:${userId}`;
    const userLimit = rateLimitStore.get(userKey);
    
    if (!userLimit || now > userLimit.resetTime) {
      // First request or window expired
      rateLimitStore.set(userKey, {
        count: 1,
        resetTime: now + windowMs
      });
    } else {
      // Increment count
      userLimit.count++;
      rateLimitStore.set(userKey, userLimit);
    }
    
    const currentCount = rateLimitStore.get(userKey)!.count;
    
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - currentCount).toString(),
      'X-RateLimit-Reset': Math.ceil(rateLimitStore.get(userKey)!.resetTime / 1000).toString()
    });

    if (currentCount > maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Maximum ${maxRequests} requests per minute.`,
        retryAfter: Math.ceil((rateLimitStore.get(userKey)!.resetTime - now) / 1000)
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    next(); // Don't block requests if rate limiting fails
  }
};

// Clean up expired entries to prevent memory leaks
function cleanupExpiredEntries(now: number): void {
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Optional: Periodic cleanup (run every 5 minutes)
setInterval(() => {
  cleanupExpiredEntries(Date.now());
}, 5 * 60 * 1000);