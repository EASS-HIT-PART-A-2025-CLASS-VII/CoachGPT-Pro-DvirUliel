"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
jest.mock('../src/services/llm.service', () => {
    const mockInstance = {
        isReady: jest.fn(),
        checkHealth: jest.fn(),
        getAvailableModels: jest.fn(),
        testGeneration: jest.fn(),
        initialize: jest.fn(),
        generateResponse: jest.fn(),
        generateStreamResponse: jest.fn(),
        pullModel: jest.fn(),
        reinitialize: jest.fn()
    };
    return {
        LLMService: {
            getInstance: jest.fn(() => mockInstance)
        }
    };
});
const health_route_1 = __importDefault(require("../src/routes/health.route"));
const llm_service_1 = require("../src/services/llm.service");
const error_middleware_1 = require("../src/middlewares/error.middleware");
describe('Health Routes', () => {
    let app;
    let mockLLMService;
    beforeEach(() => {
        jest.clearAllMocks();
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/health', health_route_1.default);
        app.use(error_middleware_1.errorHandler);
        mockLLMService = llm_service_1.LLMService.getInstance();
        mockLLMService.isReady.mockReturnValue(true);
        mockLLMService.checkHealth.mockResolvedValue(true);
        mockLLMService.getAvailableModels.mockResolvedValue(['llama3.2:3b']);
        mockLLMService.testGeneration.mockResolvedValue(undefined);
    });
    describe('GET /health', () => {
        it('should return healthy status when service is ready', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                data: {
                    status: 'healthy',
                    services: {
                        ollama: true,
                        llmService: true
                    },
                    timestamp: expect.any(String),
                    uptime: expect.any(Number)
                }
            });
            expect(mockLLMService.checkHealth).toHaveBeenCalledTimes(1);
        });
        it('should return unhealthy status when ollama is down', async () => {
            mockLLMService.checkHealth.mockResolvedValue(false);
            const response = await (0, supertest_1.default)(app)
                .get('/health');
            expect(response.status).toBe(503);
            expect(response.body.data.status).toBe('unhealthy');
            expect(response.body.data.services.ollama).toBe(false);
        });
        it('should handle errors gracefully', async () => {
            mockLLMService.checkHealth.mockRejectedValue(new Error('Connection failed'));
            const response = await (0, supertest_1.default)(app)
                .get('/health');
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /health/ready', () => {
        it('should return ready when all services are up', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health/ready');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                ready: true,
                services: {
                    ollama: true,
                    llmService: true
                },
                timestamp: expect.any(String)
            });
        });
        it('should return not ready when LLM is not initialized', async () => {
            mockLLMService.isReady.mockReturnValue(false);
            const response = await (0, supertest_1.default)(app)
                .get('/health/ready');
            expect(response.status).toBe(503);
            expect(response.body.ready).toBe(false);
            expect(response.body.services?.llmService).toBe(false);
        });
        it('should handle check health errors', async () => {
            mockLLMService.checkHealth.mockRejectedValue(new Error('Check failed'));
            const response = await (0, supertest_1.default)(app)
                .get('/health/ready');
            expect(response.status).toBe(503);
            expect(response.body.ready).toBe(false);
            expect(response.body.error).toBe('Check failed');
        });
    });
    describe('GET /health/live', () => {
        it('should always return live status', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health/live');
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                live: true,
                timestamp: expect.any(String),
                uptime: expect.any(Number),
                memoryUsage: {
                    used: expect.any(Number),
                    total: expect.any(Number)
                }
            });
        });
    });
    describe('GET /health/test', () => {
        it('should successfully test AI generation', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health/test');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                data: {
                    message: 'AI generation test completed successfully',
                    responseTime: expect.stringMatching(/\d+ms/),
                    status: 'operational',
                    timestamp: expect.any(String)
                }
            });
            expect(mockLLMService.testGeneration).toHaveBeenCalledTimes(1);
        });
        it('should return error when generation test fails', async () => {
            mockLLMService.testGeneration.mockRejectedValue(new Error('Generation failed'));
            const response = await (0, supertest_1.default)(app)
                .get('/health/test');
            expect(response.status).toBe(500);
            expect(response.body).toMatchObject({
                success: false,
                error: 'AI generation test failed',
                details: 'Generation failed'
            });
        });
        it('should return 503 when service is not ready', async () => {
            mockLLMService.isReady.mockReturnValue(false);
            const response = await (0, supertest_1.default)(app)
                .get('/health/test');
            expect(response.status).toBe(503);
            expect(response.body).toEqual({
                success: false,
                error: 'LLM service not ready',
                timestamp: expect.any(String)
            });
        });
    });
    describe('GET /health/detailed', () => {
        it('should return detailed health information', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health/detailed');
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('services');
            expect(response.body.data).toHaveProperty('system');
            expect(response.body.data.services.ollama).toHaveProperty('availableModels');
        });
    });
});
//# sourceMappingURL=health.test.js.map