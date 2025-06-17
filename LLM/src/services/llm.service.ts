import axios from 'axios';
import { ChatMessage, UserContext } from '../types';

export class LLMService {
  private ollamaUrl: string;
  private model: string;

  constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q4_K_M';
  }

  async generateResponse(messages: ChatMessage[]) {
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model: this.model,
        messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000
        }
      }, { timeout: 30000 });

      return {
        content: response.data.message.content,
        responseTime: Date.now() - startTime
      };
    } catch (error: any) {
      throw new Error(`LLM Error: ${error.message}`);
    }
  }

  async generateStreamResponse(messages: ChatMessage[]) {
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model: this.model,
        messages,
        stream: true,
        options: { temperature: 0.7, top_p: 0.9, max_tokens: 1000 }
      }, { responseType: 'stream', timeout: 60000 });

      return this.parseStreamResponse(response.data);
    } catch (error: any) {
      throw new Error(`LLM Stream Error: ${error.message}`);
    }
  }

  private async* parseStreamResponse(stream: any) {
    let buffer = '';
    for await (const chunk of stream) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message?.content) {
              yield parsed.message.content;
            }
            if (parsed.done) return;
          } catch (e) {
            continue;
          }
        }
      }
    }
  }

  buildFitnessPrompt(
    userQuery: string, 
    userContext?: any, 
    conversationHistory?: ChatMessage[]
  ): ChatMessage[] {
    const systemPrompt = `You are CoachGPT Pro, an expert AI fitness coach. Provide personalized workout advice, nutrition guidance, and motivation.

GUIDELINES:
- Prioritize safety and proper form
- Be encouraging and supportive
- Give specific, actionable advice
- Keep responses concise (150-300 words)

${userContext ? `USER INFO: ${JSON.stringify(userContext)}` : ''}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory.slice(-10)); // Take last 10 messages
    }

    // Add current user query
    messages.push({ role: 'user', content: userQuery });

    return messages;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      return response.data.models?.map((model: any) => model.name) || [];
    } catch {
      return [];
    }
  }

  async pullModel(modelName: string): Promise<boolean> {
    try {
      await axios.post(`${this.ollamaUrl}/api/pull`, {
        name: modelName
      }, {
        timeout: 300000 // 5 minutes for model download
      });
      return true;
    } catch (error) {
      console.error(`Failed to pull model ${modelName}:`, error);
      return false;
    }
  }
}