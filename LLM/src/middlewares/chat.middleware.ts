import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const chatRequestSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  message: Joi.string().min(1).max(2000).required(),
  conversationId: Joi.string().uuid().optional(),
  includeHistory: Joi.boolean().optional().default(true)
});

const conversationRequestSchema = Joi.object({
  userId: Joi.string().uuid().required()
});

export const validateChatRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = chatRequestSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
    return;
  }
  
  req.body = value;
  next();
};

export const validateConversationRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = conversationRequestSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
    return;
  }
  
  req.body = value;
  next();
};