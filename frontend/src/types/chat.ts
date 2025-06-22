// types/chat.ts
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  userId: string;
  message: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Updated ChatResponse to match your API response
export interface ChatResponse {
  success?: boolean;
  response?: string;  // For compatibility with your current API
  content?: string;   // Alternative property name
  message?: string;   // Another alternative
  data?: {
    response?: string;
    content?: string;
  };
  error?: string;
}

export interface AvailableModelsResponse {
  success: boolean;
  models: string[];
}

// Stream chunk type
export interface StreamChunk {
  response?: string;
  content?: string;
  delta?: string;
  done?: boolean;
}