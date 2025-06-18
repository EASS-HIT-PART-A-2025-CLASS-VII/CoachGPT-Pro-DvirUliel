import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { validateChatRequest, validateConversationRequest } from '../middlewares/chat.middleware';
import { rateLimitMiddleware } from '../middlewares/rate-limit.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

// Create router instance
const router = Router();

// Create controller instance
const chatController = new ChatController();

// Chat endpoints 
router.post('/',  
  rateLimitMiddleware,
  validateChatRequest,
  asyncHandler(chatController.chat)
);

router.post('/stream',  
  rateLimitMiddleware,
  validateChatRequest,
  asyncHandler(chatController.streamChat)
);

// Conversation management
router.get('/conversations/:userId',
  asyncHandler(chatController.getHistory)
);

router.get('/conversation/:conversationId',
  asyncHandler(chatController.getConversation)
);

router.delete('/conversation/:conversationId',
  validateConversationRequest,
  asyncHandler(chatController.deleteConversation)
);

// User context management
router.post('/context/:userId',
  asyncHandler(chatController.setUserContext)
);

router.get('/context/:userId',
  asyncHandler(chatController.getUserContext)
);

router.delete('/context/:userId',
  asyncHandler(chatController.clearUserContext)
);

// Model management
router.get('/models',
  asyncHandler(chatController.getAvailableModels)
);

router.post('/models/pull/:modelName',
  asyncHandler(chatController.pullModel)
);

// Health check (basic one for this controller)
router.get('/health',
  asyncHandler(chatController.healthCheck)
);

// Export the router
export default router;