import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import your existing routes
import authRoutes from './routes/authRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import planRoutes from './routes/planRoutes';

// Import the new health routes
import healthRoutes from './routes/healthRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check routes (should be first for Docker health checks)
app.use('/', healthRoutes);

// API routes
app.use('/auth', authRoutes);
app.use('/exercises', exerciseRoutes);
app.use('/plan', planRoutes);

// Basic route for API info
app.get('/', (req, res) => {
  res.json({
    message: 'CoachGPT Pro Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/auth',
      exercises: '/exercises',
      plan: '/plan'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} was not found on this server.`,
    availableEndpoints: [
      '/health',
      '/auth/register',
      '/auth/login',
      '/exercises',
      '/plan/generate'
    ]
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CoachGPT Pro Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API documentation: http://localhost:${PORT}/`);
});

export default app;