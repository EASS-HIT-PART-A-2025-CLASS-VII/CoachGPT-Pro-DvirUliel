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
const chat_route_1 = __importDefault(require("../src/routes/chat.route"));
const llm_service_1 = require("../src/services/llm.service");
const error_middleware_1 = require("../src/middlewares/error.middleware");
describe('Chat Routes', () => {
    let app;
    let mockLLMService;
    beforeEach(() => {
        jest.clearAllMocks();
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/chat', chat_route_1.default);
        app.use(error_middleware_1.errorHandler);
        mockLLMService = llm_service_1.LLMService.getInstance();
        mockLLMService.isReady.mockReturnValue(true);
        mockLLMService.generateResponse.mockResolvedValue({
            content: 'Stay hydrated and maintain proper form during exercises.',
            responseTime: 1234
        });
        mockLLMService.getAvailableModels.mockResolvedValue(['llama3.2:3b', 'mistral:7b']);
    });
    describe('POST /chat', () => {
        it('should return a successful response for valid input', async () => {
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
                .post('/chat')
                .send({
                message: 'Hello'
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toMatch(/userId|User ID/i);
        });
        it('should return 400 for empty message', async () => {
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
                .get('/chat/models');
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });
    });
});
//# sourceMappingURL=chat.test.js.map