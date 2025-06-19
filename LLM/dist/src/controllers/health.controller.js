"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const llm_service_1 = require("../services/llm.service");
class HealthController {
    constructor() {
        this.llmService = llm_service_1.LLMService.getInstance();
        this.basicHealth = async (req, res, next) => {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.detailedHealth = async (req, res, next) => {
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
                                url: process.env.OLLAMA_URL || 'http://localhost:11434',
                                currentModel: process.env.OLLAMA_MODEL || 'llama3.2:3b',
                                availableModels: models
                            },
                            llmService: {
                                status: this.llmService.isReady(),
                                timeout: process.env.LLM_TIMEOUT || '70000ms',
                                maxTokens: process.env.DEFAULT_MAX_TOKENS || '200'
                            }
                        },
                        system: {
                            environment: process.env.NODE_ENV || 'development',
                            uptime: process.uptime(),
                            memory: process.memoryUsage(),
                            version: '1.0.0',
                            rateLimiting: 'in-memory'
                        },
                        timestamp: new Date().toISOString()
                    }
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.readinessProbe = async (req, res) => {
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
            }
            catch (error) {
                res.status(503).json({
                    ready: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        };
        this.livenessProbe = (req, res) => {
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
        this.dependenciesStatus = async (req, res, next) => {
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
            }
            catch (error) {
                next(error);
            }
        };
        this.performanceMetrics = async (req, res, next) => {
            try {
                const startTime = Date.now();
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
                            model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
                            timeout: process.env.LLM_TIMEOUT || '70000',
                            maxTokens: process.env.DEFAULT_MAX_TOKENS || '200',
                            temperature: process.env.DEFAULT_TEMPERATURE || '0.7'
                        }
                    }
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.testGeneration = async (req, res, next) => {
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
                }
                catch (error) {
                    const responseTime = Date.now() - startTime;
                    res.status(500).json({
                        success: false,
                        error: 'AI generation test failed',
                        details: error.message,
                        responseTime: `${responseTime}ms`,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=health.controller.js.map