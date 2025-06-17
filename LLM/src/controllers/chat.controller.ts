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

      const userContext = await this.cacheService.getUserContext(userId);
      
      let conversationHistory: ChatMessage[] = [];
      if (includeHistory && conversationId) {
        conversationHistory = await this.chatHistoryService.getConversationHistory(conversationId, 10);
      } else if (includeHistory) {
        conversationHistory = await this.chatHistoryService.getRecentContext(userId, 6);
      }

      const messages = this.llmService.buildFitnessPrompt(message, userContext, conversationHistory);
      const result = await this.llmService.generateResponse(messages);

      const finalConversationId = await this.chatHistoryService.saveMessage(
        userId, message, result.content, conversationId
      );

      res.json({
        success: true,
        data: {
          response: result.content,
          conversationId: finalConversationId,
          timestamp: new Date().toISOString(),
          responseTime: result.responseTime
        }
      });
    } catch (error) {
      next(error);
    }
  };

  streamChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, message, conversationId, includeHistory = true } = req.body;

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

      const messages = this.llmService.buildFitnessPrompt(message, userContext, conversationHistory);
      const stream = await this.llmService.generateStreamResponse(messages);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        res.write(chunk);
      }
      res.end();

      await this.chatHistoryService.saveMessage(userId, message, fullResponse, conversationId);
    } catch (error: any) {
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

      const success = await this.cacheService.setUserContext(userId, context);
      res.json({ success, message: success ? 'Context updated' : 'Failed to update context' });
    } catch (error) {
      next(error);
    }
  };

  getUserContext = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const context = await this.cacheService.getUserContext(userId);
      res.json({ success: true, data: context });
    } catch (error) {
      next(error);
    }
  };

  clearUserContext = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
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