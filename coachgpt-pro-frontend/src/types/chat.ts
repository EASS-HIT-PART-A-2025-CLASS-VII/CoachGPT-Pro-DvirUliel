export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }
  
  export interface ChatRequest {
    userId: string;
    message: string;
  }
  
  export interface ChatResponse {
    success: boolean;
    data: {
      response: string;
      timestamp: string;
      responseTime: number;
    };
  }
  
  export interface StreamChatResponse {
    success: boolean;
    data: ReadableStream;
  }
  
  export interface AvailableModelsResponse {
    success: boolean;
    data: {
      availableModels: string[];
      currentModel: string;
    };
  }