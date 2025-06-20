import { apiUtils } from './api';
import { ChatRequest, ChatResponse, AvailableModelsResponse } from '../types/chat';

class ChatService {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await apiUtils.llm.post<ChatResponse>('/chat', request);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send message');
    }
  }

  async sendStreamMessage(request: ChatRequest): Promise<ReadableStream> {
    try {
      const stream = await apiUtils.llm.stream('/chat/stream', request);
      return stream;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send streaming message');
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

  // Parse streaming response
  async parseStreamResponse(stream: ReadableStream): Promise<AsyncGenerator<string, void, unknown>> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    return (async function* () {
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.response) {
                  yield parsed.response;
                }
                if (parsed.done) return;
              } catch (e) {
                // If not JSON, treat as plain text
                yield line;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    })();
  }
}

export default new ChatService();