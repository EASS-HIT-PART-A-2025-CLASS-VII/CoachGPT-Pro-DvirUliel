import { Request, Response, NextFunction } from 'express';
import { LLMService } from '../services/llm.service';
import dotenv from 'dotenv';

dotenv.config();

export class HealthController {
  private llmService = LLMService.getInstance(); // Singleton instance

  basicHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ollamaHealthy = await this.llmService.checkHealth();

      const status = ollamaHealthy ? 'healthy' : 'unhealthy';
      const statusCode = status === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        success: true,
        data: {
          status,
          services: {
            ollama: ollamaHealthy,
            llmService: this.llmService.isReady()
          },
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  detailedHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [models, ollamaHealthy] = await Promise.all([
        this.llmService.getAvailableModels(),
        this.llmService.checkHealth()
      ]);

      res.json({
        success: true,
        data: {
          status: ollamaHealthy ? 'healthy' : 'unhealthy',
          services: {
            ollama: {
              status: ollamaHealthy,
              url: process.env.OLLAMA_URL,
              currentModel: process.env.OLLAMA_MODEL,
              availableModels: models
            },
            llmService: {
              status: this.llmService.isReady(),
              timeout: process.env.LLM_TIMEOUT,
              maxTokens: process.env.DEFAULT_MAX_TOKENS
            }
          },
          system: {
            environment: process.env.NODE_ENV,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: '1.0.0',
            rateLimiting: 'in-memory'
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  readinessProbe = async (req: Request, res: Response): Promise<void> => {
    try {
      const ollamaReady = await this.llmService.checkHealth();
      const llmReady = this.llmService.isReady();
      
      const isReady = ollamaReady && llmReady;
      
      res.status(isReady ? 200 : 503).json({
        ready: isReady,
        services: { 
          ollama: ollamaReady, 
          llmService: llmReady 
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(503).json({
        ready: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  livenessProbe = (req: Request, res: Response): void => {
    res.json({
      live: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    });
  };

  dependenciesStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ollamaHealthy = await this.llmService.checkHealth();
      const llmReady = this.llmService.isReady();

      const dependencies = [
        {
          name: 'Ollama LLM Engine',
          status: ollamaHealthy ? 'healthy' : 'unhealthy',
          critical: true,
          description: 'AI model inference engine'
        },
        {
          name: 'LLM Service',
          status: llmReady ? 'ready' : 'initializing',
          critical: true,
          description: 'CoachGPT Pro service layer'
        }
      ];

      const criticalFailures = dependencies.filter(dep => dep.critical && dep.status !== 'healthy' && dep.status !== 'ready');

      res.json({
        success: true,
        data: {
          overallStatus: criticalFailures.length > 0 ? 'unhealthy' : 'healthy',
          criticalFailures: criticalFailures.length,
          dependencies,
          timestamp: new Date().toISOString(),
          architecture: 'simplified-llm-service'
        }
      });
    } catch (error) {
      next(error);
    }
  };

  performanceMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const startTime = Date.now();
      
      // Test service response times
      const ollamaHealthy = await this.llmService.checkHealth();
      const totalResponseTime = Date.now() - startTime;

      res.json({
        success: true,
        data: {
          timestamp: new Date().toISOString(),
          responseTime: {
            healthCheck: `${totalResponseTime}ms`,
            services: {
              ollama: ollamaHealthy ? 'available' : 'unavailable'
            }
          },
          system: {
            uptime: process.uptime(),
            memory: {
              used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
              total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
              rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
              external: Math.round(process.memoryUsage().external / 1024 / 1024)
            },
            cpu: process.cpuUsage(),
            platform: process.platform,
            nodeVersion: process.version
          },
          configuration: {
            model: process.env.OLLAMA_MODEL,
            timeout: process.env.LLM_TIMEOUT,
            maxTokens: process.env.DEFAULT_MAX_TOKENS,
            temperature: process.env.DEFAULT_TEMPERATURE
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // New endpoint: Test AI generation
  testGeneration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.llmService.isReady()) {
        res.status(503).json({
          success: false,
          error: 'LLM service not ready',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const startTime = Date.now();
      
      try {
        await this.llmService.testGeneration();
        const responseTime = Date.now() - startTime;
        
        res.json({
          success: true,
          data: {
            message: 'AI generation test completed successfully',
            responseTime: `${responseTime}ms`,
            status: 'operational',
            timestamp: new Date().toISOString()
          }
        });
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        
        res.status(500).json({
          success: false,
          error: 'AI generation test failed',
          details: error.message,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      next(error);
    }
  };
}