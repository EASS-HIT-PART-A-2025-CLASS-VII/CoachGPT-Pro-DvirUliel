export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp?: Date;
  }
  
  export interface ChatRequest {
    userId: string;
    message: string;
    conversationId?: string;
    includeHistory?: boolean;
  }
  
  export interface ChatResponse {
    success: boolean;
    data?: {
      response: string;
      conversationId: string;
      timestamp: string;
      responseTime?: number;
    };
    error?: string;
  }
  
  export interface UserContext {
    id: string;
    name: string;
    fitnessGoals?: string[];
    currentPlan?: any;
    preferences?: {
      workoutStyle?: string;
      equipment?: string[];
      limitations?: string[];
    };
  }