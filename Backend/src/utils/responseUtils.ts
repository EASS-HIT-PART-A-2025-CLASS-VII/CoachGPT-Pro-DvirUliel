import { Response } from 'express';

// Helper function for error responses
export const sendError = (res: Response, status: number, message: string): void => {
  res.status(status).json({ error: message });
};

// Helper function for success responses
export const sendSuccess = (res: Response, data: any, status = 200): void => {
  res.status(status).json({ status: 'success', ...data });
};