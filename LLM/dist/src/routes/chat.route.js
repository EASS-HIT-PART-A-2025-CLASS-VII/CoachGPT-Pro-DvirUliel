"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const router = (0, express_1.Router)();
const chatController = new chat_controller_1.ChatController();
router.post('/', rate_limit_middleware_1.rateLimitMiddleware, (0, error_middleware_1.asyncHandler)(chatController.chat));
router.post('/stream', rate_limit_middleware_1.rateLimitMiddleware, (0, error_middleware_1.asyncHandler)(chatController.streamChat));
router.get('/models', (0, error_middleware_1.asyncHandler)(chatController.getAvailableModels));
exports.default = router;
//# sourceMappingURL=chat.route.js.map