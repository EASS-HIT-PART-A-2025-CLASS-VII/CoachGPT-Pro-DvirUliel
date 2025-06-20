import { Request, Response, NextFunction } from 'express';

// Logs all requests with timestamp, method, path, status, duration
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - start;
    
    // Skip health check logs unless there's an error
    if (!req.path.includes('/health') || res.statusCode >= 400) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};