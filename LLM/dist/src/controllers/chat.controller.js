"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const llm_service_1 = require("../services/llm.service");
class ChatController {
    constructor() {
        this.llmService = llm_service_1.LLMService.getInstance();
        this.chat = async (req, res, next) => {
            try {
                const { userId, message } = req.body;
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
                if (!this.llmService.isReady()) {
                    res.status(503).json({
                        success: false,
                        error: 'LLM service is not ready. Please try again in a moment.'
                    });
                    return;
                }
                console.log(`💬 Chat request from user ${userId}: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
                const messages = [
                    { role: 'user', content: message.trim() }
                ];
                const result = await this.llmService.generateResponse(messages);
                console.log(`✅ Chat response generated for user ${userId} in ${result.responseTime}ms`);
                res.json({
                    success: true,
                    data: {
                        response: result.content,
                        timestamp: new Date().toISOString(),
                        responseTime: result.responseTime
                    }
                });
            }
            catch (error) {
                console.error('Chat error:', error);
                next(error);
            }
        };
        this.streamChat = async (req, res, next) => {
            try {
                const { userId, message } = req.body;
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
                if (!this.llmService.isReady()) {
                    res.status(503).json({
                        success: false,
                        error: 'LLM service is not ready. Please try again in a moment.'
                    });
                    return;
                }
                console.log(`🌊 Stream chat request from user ${userId}`);
                res.writeHead(200, {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Transfer-Encoding': 'chunked',
                    'Cache-Control': 'no-cache'
                });
                const messages = [
                    { role: 'user', content: message.trim() }
                ];
                const stream = await this.llmService.generateStreamResponse(messages);
                for await (const chunk of stream) {
                    res.write(chunk);
                }
                res.end();
                console.log(`✅ Stream chat completed for user ${userId}`);
            }
            catch (error) {
                console.error('Stream chat error:', error);
                if (!res.headersSent) {
                    next(error);
                }
                else {
                    res.write(`\nError: ${error.message}`);
                    res.end();
                }
            }
        };
        this.getAvailableModels = async (req, res, next) => {
            try {
                const models = await this.llmService.getAvailableModels();
                res.json({
                    success: true,
                    data: {
                        availableModels: models,
                        currentModel: process.env.OLLAMA_MODEL || 'llama3.2:3b'
                    }
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map