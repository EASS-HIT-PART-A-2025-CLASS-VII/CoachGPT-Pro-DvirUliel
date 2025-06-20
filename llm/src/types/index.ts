// Type definitions for the LLM service

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }
  
  export interface GenerateResponse {
    content: string;
    responseTime: number;
  }
  
  export interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'initializing';
    services: {
      ollama: boolean;
      llmService: boolean;
    };
    timestamp: string;
    uptime: number;
  }
  
  export interface ErrorResponse {
    success: false;
    error: {
      message: string;
      statusCode: number;
      timestamp: string;
      path: string;
      stack?: string;
    };
  }
  
  export interface SuccessResponse<T = any> {
    success: true;
    data: T;
  }
  
  export interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
  }