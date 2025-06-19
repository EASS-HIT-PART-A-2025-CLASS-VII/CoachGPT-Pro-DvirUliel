import { Request, Response } from 'express';
import { pool } from '../db/db';

// Health check with database connectivity test
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // Test database connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
};

// Ready check - indicates service is ready to receive traffic
export const readyCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
};

// Live check - indicates service is alive (basic liveness probe)
export const liveCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
};
