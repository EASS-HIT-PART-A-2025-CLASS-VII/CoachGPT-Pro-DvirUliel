import { apiUtils } from './api';
import { ChatRequest, ChatResponse, AvailableModelsResponse } from '../types/chat';

class ChatService {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      console.log('💬 Sending message to /chat endpoint:', request);
      const response = await apiUtils.llm.post<ChatResponse>('/chat', request);
      console.log('✅ Received response structure:', response);
      console.log('✅ Response type:', typeof response);
      console.log('✅ Response keys:', response ? Object.keys(response) : 'null');
      return response;
    } catch (error: any) {
      console.error('❌ Chat request failed:', error);
      throw new Error(error.message || 'Failed to send message');
    }
  }

  async getAvailableModels(): Promise<AvailableModelsResponse> {
    try {
      const response = await apiUtils.llm.get<AvailableModelsResponse>('/chat/models');
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch available models');
    }
  }

  async checkLLMHealth(): Promise<{ status: string; services: any }> {
    try {
      const response = await apiUtils.llm.get<{ success: boolean; data: any }>('/health');
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'LLM service health check failed');
    }
  }

  // Validate chat request
  validateChatRequest(request: Partial<ChatRequest>): string[] {
    const errors: string[] = [];

    if (!request.userId?.trim()) {
      errors.push('User ID is required');
    }

    if (!request.message?.trim()) {
      errors.push('Message is required');
    }

    if (request.message && request.message.length > 2000) {
      errors.push('Message is too long (max 2000 characters)');
    }

    return errors;
  }
}

export default new ChatService();