"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitMiddleware = void 0;
const rateLimitStore = new Map();
const rateLimitMiddleware = async (req, res, next) => {
    try {
        const userId = req.body.userId || req.params.userId;
        if (!userId) {
            res.status(400).json({
                success: false,
                error: 'User ID required for rate limiting'
            });
            return;
        }
        const windowMs = 60000;
        const maxRequests = 10;
        const now = Date.now();
        cleanupExpiredEntries(now);
        const userKey = `rate_limit:${userId}`;
        const userLimit = rateLimitStore.get(userKey);
        if (!userLimit || now > userLimit.resetTime) {
            rateLimitStore.set(userKey, {
                count: 1,
                resetTime: now + windowMs
            });
        }
        else {
            userLimit.count++;
            rateLimitStore.set(userKey, userLimit);
        }
        const currentCount = rateLimitStore.get(userKey).count;
        res.set({
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, maxRequests - currentCount).toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimitStore.get(userKey).resetTime / 1000).toString()
        });
        if (currentCount > maxRequests) {
            res.status(429).json({
                success: false,
                error: 'Rate limit exceeded',
                message: `Too many requests. Maximum ${maxRequests} requests per minute.`,
                retryAfter: Math.ceil((rateLimitStore.get(userKey).resetTime - now) / 1000)
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Rate limiting error:', error);
        next();
    }
};
exports.rateLimitMiddleware = rateLimitMiddleware;
function cleanupExpiredEntries(now) {
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}
setInterval(() => {
    cleanupExpiredEntries(Date.now());
}, 5 * 60 * 1000);
//# sourceMappingURL=rate-limit.middleware.js.map