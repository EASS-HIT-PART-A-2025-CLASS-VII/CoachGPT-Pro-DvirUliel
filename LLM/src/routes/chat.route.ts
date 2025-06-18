import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { rateLimitMiddleware } from '../middlewares/rate-limit.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

// Create router instance
const router = Router();

// Create controller instance
const chatController = new ChatController();

// Core chat endpoints - SIMPLIFIED
router.post('/', 
  rateLimitMiddleware,
  asyncHandler(chatController.chat)
);

router.post('/stream', 
  rateLimitMiddleware,
  asyncHandler(chatController.streamChat)
);

// Model management
router.get('/models',
  asyncHandler(chatController.getAvailableModels)
);

// Export the router
export default router;