"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const originalJson = res.json;
    res.json = function (body) {
        const duration = Date.now() - start;
        if (!req.path.includes('/health') || res.statusCode >= 400) {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
        }
        return originalJson.call(this, body);
    };
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=logger.middleware.js.map