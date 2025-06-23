// Backend/src/server.ts - Keep it simple
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './db/db';

// Import routes
import authRoutes from './routes/auth.route';
import exerciseRoutes from './routes/exercise.route';
import planRoutes from './routes/plan.route';
import healthRoutes from './routes/health.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/', healthRoutes);
app.use('/auth', authRoutes);
app.use('/exercises', exerciseRoutes);
app.use('/plan', planRoutes);

// API info
app.get('/', (req, res) => {
  res.json({
    message: 'CoachGPT Pro Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: { health: '/health', auth: '/auth', exercises: '/exercises', plan: '/plan' }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: 'Internal Server Error' });
});

// Start server
const startServer = async () => {
  console.log('🔍 Testing database connection...');
  const dbConnected = await testConnection();
  
  app.listen(PORT, () => {
    console.log(`🚀 CoachGPT Pro Backend running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(dbConnected ? '✅ All systems ready!' : '⚠️ Database connection failed');
  });
};

// Graceful shutdown
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

// Start server (only if not imported)
if (require.main === module) {
  startServer();
}

export default app;