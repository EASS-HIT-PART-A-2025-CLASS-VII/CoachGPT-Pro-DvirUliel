import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

import chatRoutes from './routes/chat.route';
import healthRoutes from './routes/health.route';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5002'],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '5mb' }));
app.use(requestLogger);

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'CoachGPT Pro LLM Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      chat: '/api/llm/chat',
      stream: '/api/llm/chat/stream'
    }
  });
});

app.use('/health', healthRoutes);
app.use('/api/llm', chatRoutes);

// Error handling
app.use('*', notFound);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 LLM Service running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`🤖 Chat: http://localhost:${PORT}/api/llm/chat`);
  });
}

export default app;