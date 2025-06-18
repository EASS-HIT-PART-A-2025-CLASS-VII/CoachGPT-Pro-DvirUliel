import { Request, Response, NextFunction } from 'express';
import { LLMService } from '../services/llm.service';
import { ChatHistoryService } from '../services/chat-history.service';
import { CacheService } from '../services/cache.service';
import { ChatMessage } from '../types';

export class ChatController {
  private llmService = new LLMService();
  private chatHistoryService = new ChatHistoryService();
  private cacheService = new CacheService();

  chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, message, conversationId, includeHistory = true } = req.body;

      // Add validation
      if (!userId || typeof userId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Valid userId is required'
        });
        return;
      }

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Valid message is required'
        });
        return;
      }

      // Check if LLM service is ready
      if (!this.llmService.isReady()) {
        res.status(503).json({
          success: false,
          error: 'LLM service is not ready. Model initialization in progress.'
        });
        return;
      }

      console.log(`💬 Chat request from user ${userId}: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

      const userContext = await this.cacheService.getUserContext(userId);
      
      let conversationHistory: ChatMessage[] = [];
      if (includeHistory && conversationId) {
        conversationHistory = await this.chatHistoryService.getConversationHistory(conversationId, 10);
      } else if (includeHistory) {
        conversationHistory = await this.chatHistoryService.getRecentContext(userId, 6);
      }

      const messages = this.llmService.buildFitnessPrompt(message.trim(), userContext, conversationHistory);
      const result = await this.llmService.generateResponse(messages);

      const finalConversationId = await this.chatHistoryService.saveMessage(
        userId, message.trim(), result.content, conversationId
      );

      console.log(`✅ Chat response generated for user ${userId} in ${result.responseTime}ms`);

      res.json({
        success: true,
        data: {
          response: result.content,
          conversationId: finalConversationId,
          timestamp: new Date().toISOString(),
          responseTime: result.responseTime
        }
      });
    } catch (error: any) {
      console.error('Chat error:', error);
      next(error);
    }
  };

  streamChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, message, conversationId, includeHistory = true } = req.body;

      // Add validation
      if (!userId || typeof userId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Valid userId is required'
        });
        return;
      }

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Valid message is required'
        });
        return;
      }

      // Check if LLM service is ready
      if (!this.llmService.isReady()) {
        res.status(503).json({
          success: false,
          error: 'LLM service is not ready. Model initialization in progress.'
        });
        return;
      }

      console.log(`🌊 Stream chat request from user ${userId}`);

      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache'
      });

      const userContext = await this.cacheService.getUserContext(userId);
      let conversationHistory: ChatMessage[] = [];
      
      if (includeHistory && conversationId) {
        conversationHistory = await this.chatHistoryService.getConversationHistory(conversationId, 10);
      } else if (includeHistory) {
        conversationHistory = await this.chatHistoryService.getRecentContext(userId, 6);
      }

      const messages = this.llmService.buildFitnessPrompt(message.trim(), userContext, conversationHistory);
      const stream = await this.llmService.generateStreamResponse(messages);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        res.write(chunk);
      }
      res.end();

      await this.chatHistoryService.saveMessage(userId, message.trim(), fullResponse, conversationId);
      console.log(`✅ Stream chat completed for user ${userId}`);
      
    } catch (error: any) {
      console.error('Stream chat error:', error);
      if (!res.headersSent) {
        next(error);
      } else {
        res.write(`\nError: ${error.message}`);
        res.end();
      }
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;

      const conversations = await this.chatHistoryService.getUserConversations(userId, limit);
      res.json({ success: true, data: conversations });
    } catch (error) {
      next(error);
    }
  };

  getConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId } = req.params;
      
      if (!conversationId) {
        res.status(400).json({
          success: false,
          error: 'Conversation ID is required'
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 50;

      const messages = await this.chatHistoryService.getConversationHistory(conversationId, limit);
      res.json({ success: true, data: { conversationId, messages } });
    } catch (error) {
      next(error);
    }
  };

  deleteConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const { userId } = req.body;

      if (!conversationId || !userId) {
        res.status(400).json({
          success: false,
          error: 'Conversation ID and User ID are required'
        });
        return;
      }

      const deleted = await this.chatHistoryService.deleteConversation(conversationId, userId);
      
      if (deleted) {
        res.json({ success: true, message: 'Conversation deleted successfully' });
      } else {
        res.status(404).json({ success: false, error: 'Conversation not found' });
      }
    } catch (error) {
      next(error);
    }
  };

  setUserContext = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const context = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      const success = await this.cacheService.setUserContext(userId, context);
      res.json({ 
        success, 
        message: success ? 'Context updated successfully' : 'Failed to update context' 
      });
    } catch (error) {
      next(error);
    }
  };

  getUserContext = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      const context = await this.cacheService.getUserContext(userId);
      res.json({ success: true, data: context });
    } catch (error) {
      next(error);
    }
  };

  clearUserContext = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      await this.cacheService.del(`user_context:${userId}`);
      res.json({ success: true, message: 'User context cleared successfully' });
    } catch (error) {
      next(error);
    }
  };

  healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isHealthy = await this.llmService.checkHealth();
      const models = await this.llmService.getAvailableModels();

      res.json({
        success: true,
        data: {
          status: isHealthy ? 'healthy' : 'unhealthy',
          modelReady: this.llmService.isReady(),
          availableModels: models,
          currentModel: process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q4_K_M',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getAvailableModels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const models = await this.llmService.getAvailableModels();

      res.json({
        success: true,
        data: {
          availableModels: models,
          currentModel: process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q4_K_M'
        }
      });
    } catch (error) {
      next(error);
    }
  };

  pullModel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { modelName } = req.params;

      if (!modelName) {
        res.status(400).json({
          success: false,
          error: 'Model name is required'
        });
        return;
      }

      // This is a long-running operation, so we return immediately
      res.json({
        success: true,
        message: `Model ${modelName} pull initiated. This may take several minutes.`,
        modelName
      });

      // Pull model in background (you might want to implement a job queue for this)
      // this.llmService.pullModel(modelName);
    } catch (error) {
      next(error);
    }
  };
}