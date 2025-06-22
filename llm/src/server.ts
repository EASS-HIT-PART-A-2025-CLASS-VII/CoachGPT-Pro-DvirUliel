// server.ts - Fixed with proper initialization sequence
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { requestLogger } from './middlewares/logger.middleware';
import { errorHandler, notFound } from './middlewares/error.middleware';
import chatRoutes from './routes/chat.route';
import healthRoutes from './routes/health.route';
import { LLMService } from './services/llm.service';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5003', 10);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3001', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Routes
app.use('/health', healthRoutes);
app.use('/chat', chatRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
  console.log('🛑 Received shutdown signal, closing server gracefully...');
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
}

// Server startup with proper initialization
let server: any;

async function startServer() {
  try {
    console.log('🚀 Starting CoachGPT Pro LLM Service...');
    
    // Initialize LLM Service BEFORE starting the server
    console.log('⏳ Initializing LLM Service (this may take a few minutes on first run)...');
    const llmService = LLMService.getInstance();
    await llmService.initialize();
    
    console.log('✅ LLM Service initialized successfully');
    
    // Now start the server
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🤖 Model: ${process.env.OLLAMA_MODEL || 'llama3.2:3b'}`);
      console.log(`🔗 Ollama URL: ${process.env.OLLAMA_URL || 'http://localhost:11434'}`);
    });

  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();