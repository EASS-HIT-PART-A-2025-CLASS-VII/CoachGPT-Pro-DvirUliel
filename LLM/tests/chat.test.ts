import request from 'supertest';
import express from 'express';

// Mock the LLMService before importing routes
jest.mock('../src/services/llm.service', () => {
  const mockInstance = {
    isReady: jest.fn(),
    generateResponse: jest.fn(),
    generateStreamResponse: jest.fn(),
    getAvailableModels: jest.fn(),
    checkHealth: jest.fn(),
    initialize: jest.fn(),
    testGeneration: jest.fn(),
    pullModel: jest.fn(),
    reinitialize: jest.fn()
  };

  return {
    LLMService: {
      getInstance: jest.fn(() => mockInstance)
    }
  };
});

// Import after mocking
import chatRoutes from '../src/routes/chat.route';
import { LLMService } from '../src/services/llm.service';
import { errorHandler } from '../src/middlewares/error.middleware';

describe('Chat Routes', () => {
  let app: express.Application;
  let mockLLMService: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create Express app
    app = express();
    app.use(express.json());
    app.use('/chat', chatRoutes);
    app.use(errorHandler); // Add error handler
    
    // Get the mock instance
    mockLLMService = (LLMService.getInstance as jest.Mock)();
    
    // Set default mock behaviors
    mockLLMService.isReady.mockReturnValue(true);
    mockLLMService.generateResponse.mockResolvedValue({
      content: 'Stay hydrated and maintain proper form during exercises.',
      responseTime: 1234
    });
    mockLLMService.getAvailableModels.mockResolvedValue(['llama3.2:3b', 'mistral:7b']);
  });

  describe('POST /chat', () => {
    it('should return a successful response for valid input', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          userId: '550e8400-e29b-41d4-a716-446655440001',
          message: 'What is the best exercise for beginners?'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          response: 'Stay hydrated and maintain proper form during exercises.',
          timestamp: expect.any(String),
          responseTime: 1234
        }
      });
      expect(mockLLMService.generateResponse).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for missing userId', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          message: 'Hello'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      // Check for either error message (from rate limiter or controller)
      expect(response.body.error).toMatch(/userId|User ID/i);
    });

    it('should return 400 for empty message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          userId: '550e8400-e29b-41d4-a716-446655440001',
          message: ''
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Valid message is required'
      });
    });

    it('should return 503 when LLM service is not ready', async () => {
      mockLLMService.isReady.mockReturnValue(false);

      const response = await request(app)
        .post('/chat')
        .send({
          userId: '550e8400-e29b-41d4-a716-446655440001',
          message: 'Hello'
        });

      expect(response.status).toBe(503);
      expect(response.body).toEqual({
        success: false,
        error: 'LLM service is not ready. Please try again in a moment.'
      });
    });

    it('should handle service errors gracefully', async () => {
      mockLLMService.generateResponse.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/chat')
        .send({
          userId: '550e8400-e29b-41d4-a716-446655440001',
          message: 'Hello'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /chat/models', () => {
    it('should return available models', async () => {
      const response = await request(app)
        .get('/chat/models');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          availableModels: ['llama3.2:3b', 'mistral:7b'],
          currentModel: 'llama3.2:3b'
        }
      });
      expect(mockLLMService.getAvailableModels).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when fetching models', async () => {
      mockLLMService.getAvailableModels.mockRejectedValue(new Error('Failed to fetch models'));

      const response = await request(app)
        .get('/chat/models');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});