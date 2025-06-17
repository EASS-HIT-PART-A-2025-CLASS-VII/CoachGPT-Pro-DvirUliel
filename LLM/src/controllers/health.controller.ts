import { Request, Response, NextFunction } from 'express';
import { LLMService } from '../services/llm.service';
import { DatabaseService } from '../services/database.service';
import { CacheService } from '../services/cache.service';

export class HealthController {
  private llmService = new LLMService();
  private databaseService = new DatabaseService();
  private cacheService = new CacheService();

  basicHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [ollamaHealthy, dbHealthy, redisHealthy] = await Promise.all([
        this.llmService.checkHealth(),
        this.databaseService.checkHealth(),
        this.cacheService.checkHealth()
      ]);

      const status = ollamaHealthy && dbHealthy ? 'healthy' : 'degraded';
      const statusCode = status === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        success: true,
        data: {
          status,
          services: {
            ollama: ollamaHealthy,
            database: dbHealthy,
            redis: redisHealthy
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
      const [models, ollamaHealthy, dbHealthy, redisHealthy] = await Promise.all([
        this.llmService.getAvailableModels(),
        this.llmService.checkHealth(),
        this.databaseService.checkHealth(),
        this.cacheService.checkHealth()
      ]);

      res.json({
        success: true,
        data: {
          status: ollamaHealthy && dbHealthy ? 'healthy' : 'degraded',
          services: {
            ollama: {
              status: ollamaHealthy,
              url: process.env.OLLAMA_URL || 'http://localhost:11434',
              currentModel: process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q4_K_M',
              availableModels: models
            },
            database: {
              status: dbHealthy,
              host: process.env.DB_HOST || 'localhost',
              port: process.env.DB_PORT || 5432
            },
            redis: {
              status: redisHealthy,
              url: process.env.REDIS_URL || 'redis://localhost:6379'
            }
          },
          system: {
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: '1.0.0'
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
      const [ollamaReady, dbReady] = await Promise.all([
        this.llmService.checkHealth(),
        this.databaseService.checkHealth()
      ]);

      const isReady = ollamaReady && dbReady;
      
      res.status(isReady ? 200 : 503).json({
        ready: isReady,
        services: { ollama: ollamaReady, database: dbReady },
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
      uptime: process.uptime()
    });
  };

  dependenciesStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [ollamaHealthy, dbHealthy, redisHealthy] = await Promise.all([
        this.llmService.checkHealth(),
        this.databaseService.checkHealth(),
        this.cacheService.checkHealth()
      ]);

      const dependencies = [
        {
          name: 'Ollama LLM Service',
          status: ollamaHealthy ? 'healthy' : 'unhealthy',
          critical: true
        },
        {
          name: 'PostgreSQL Database',
          status: dbHealthy ? 'healthy' : 'unhealthy',
          critical: true
        },
        {
          name: 'Redis Cache',
          status: redisHealthy ? 'healthy' : 'unhealthy',
          critical: false
        }
      ];

      const criticalFailures = dependencies.filter(dep => dep.critical && dep.status !== 'healthy');

      res.json({
        success: true,
        data: {
          overallStatus: criticalFailures.length > 0 ? 'unhealthy' : 'healthy',
          criticalFailures: criticalFailures.length,
          dependencies,
          timestamp: new Date().toISOString()
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
      const [ollamaHealthy, dbHealthy, redisHealthy] = await Promise.all([
        this.llmService.checkHealth(),
        this.databaseService.checkHealth(),
        this.cacheService.checkHealth()
      ]);

      const totalResponseTime = Date.now() - startTime;

      res.json({
        success: true,
        data: {
          timestamp: new Date().toISOString(),
          responseTime: {
            total: `${totalResponseTime}ms`,
            services: {
              ollama: ollamaHealthy ? 'available' : 'unavailable',
              database: dbHealthy ? 'available' : 'unavailable',
              redis: redisHealthy ? 'available' : 'unavailable'
            }
          },
          system: {
            uptime: process.uptime(),
            memory: {
              used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
              total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
              rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
            },
            cpu: process.cpuUsage()
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };
}