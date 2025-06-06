// src/routes/healthRoutes.ts
import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const pool = new Pool({
      host: process.env.DB_HOST || 'db',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'coachgpt',
      user: process.env.DB_USER || 'coach',
      password: process.env.DB_PASSWORD || 'secret',
    });

    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.end();

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
});

// Ready check endpoint
router.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

// Live check endpoint
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

export default router;