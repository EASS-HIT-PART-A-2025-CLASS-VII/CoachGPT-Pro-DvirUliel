"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_middleware_1 = require("./middlewares/logger.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const chat_route_1 = __importDefault(require("./routes/chat.route"));
const health_route_1 = __importDefault(require("./routes/health.route"));
const llm_service_1 = require("./services/llm.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5003', 10);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger_middleware_1.requestLogger);
app.use('/health', health_route_1.default);
app.use('/chat', chat_route_1.default);
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
async function gracefulShutdown() {
    console.log('🛑 Received shutdown signal, closing server gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 30000);
}
let server;
async function startServer() {
    try {
        console.log('🚀 Starting CoachGPT Pro LLM Service...');
        console.log('⏳ Initializing LLM Service (this may take a few minutes on first run)...');
        const llmService = llm_service_1.LLMService.getInstance();
        await llmService.initialize();
        console.log('✅ LLM Service initialized successfully');
        server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}/health`);
            console.log(`🤖 Model: ${process.env.OLLAMA_MODEL || 'llama3.2:3b'}`);
            console.log(`🔗 Ollama URL: ${process.env.OLLAMA_URL || 'http://localhost:11434'}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map