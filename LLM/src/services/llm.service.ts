// Enhanced llm.service.ts - Self-managing model pulling
import axios from 'axios';
import { ChatMessage } from '../types';

export class LLMService {
  private ollamaUrl: string;
  private model: string;
  private healthCheckCache: { healthy: boolean; lastCheck: number } = { healthy: false, lastCheck: 0 };
  private modelInitialized: boolean = false;
  private initializationInProgress: boolean = false;
  private readonly CACHE_TTL = 10000; // 10 seconds cache

  constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q4_K_M';
    
    // Start initialization in background
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    if (this.initializationInProgress) return;
    
    this.initializationInProgress = true;
    console.log(`🚀 Initializing LLM service with model: ${this.model}`);

    try {
      // Wait for Ollama to be ready
      await this.waitForOllama();
      
      // Check if model exists, pull if needed
      await this.ensureModelExists();
      
      this.modelInitialized = true;
      console.log(`✅ LLM service initialized successfully`);
      
    } catch (error: any) {
      console.error(`❌ LLM service initialization failed:`, error.message);
    } finally {
      this.initializationInProgress = false;
    }
  }

  private async waitForOllama(maxRetries: number = 30): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await axios.get(`${this.ollamaUrl}/api/tags`, { timeout: 5000 });
        if (response.status === 200) {
          console.log(`✅ Ollama is ready after ${i + 1} attempts`);
          return;
        }
      } catch (error) {
        console.log(`⏳ Waiting for Ollama... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    throw new Error('Ollama not ready after maximum retries');
  }

  private async ensureModelExists(): Promise<void> {
    try {
      // Check if model exists
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      const models = response.data?.models || [];
      const modelExists = models.some((model: any) => {
        const modelName = model.name || '';
        return modelName === this.model || modelName.startsWith(this.model.split(':')[0]);
      });

      if (modelExists) {
        console.log(`✅ Model ${this.model} already exists`);
        return;
      }

      // Pull model if it doesn't exist
      console.log(`📥 Pulling model: ${this.model} (this may take several minutes...)`);
      await axios.post(`${this.ollamaUrl}/api/pull`, {
        name: this.model
      }, {
        timeout: 600000 // 10 minutes for model download
      });

      console.log(`✅ Model ${this.model} pulled successfully`);
      
    } catch (error: any) {
      console.error(`❌ Error ensuring model exists:`, error.message);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if recent
    if (now - this.healthCheckCache.lastCheck < this.CACHE_TTL) {
      return this.healthCheckCache.healthy;
    }

    try {
      // Quick check - if model not ready, return false immediately
      if (!this.modelInitialized) {  // FIXED: was this.modelReady
        console.log(`⏳ Model initialization in progress...`);
        this.healthCheckCache = { healthy: false, lastCheck: now };
        return false;
      }

      // Check if Ollama is responding - INCREASED TIMEOUT
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: 30000,  // CHANGED: 5000 -> 30000 (30 seconds)
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status !== 200) {
        throw new Error(`Ollama API returned status ${response.status}`);
      }

      // Verify model is still available
      const models = response.data?.models || [];
      const modelAvailable = models.some((model: any) => {
        const modelName = model.name || '';
        return modelName === this.model || modelName.startsWith(this.model.split(':')[0]);
      });

      if (!modelAvailable) {
        console.warn(`⚠️  Model ${this.model} not found. Service unhealthy.`);
        this.modelInitialized = false;  // FIXED: was this.modelReady
        this.healthCheckCache = { healthy: false, lastCheck: now };
        return false;
      }

      console.log(`✅ Ollama health check passed. Model ${this.model} is ready.`);
      this.healthCheckCache = { healthy: true, lastCheck: now };
      return true;

    } catch (error: any) {
      console.error(`❌ Ollama health check failed:`, {
        url: this.ollamaUrl,
        model: this.model,
        error: error.message,
        initialized: this.modelInitialized  // FIXED: was ready
      });
      
      this.healthCheckCache = { healthy: false, lastCheck: now };
      return false;
    }
  }

  async generateResponse(messages: ChatMessage[]) {
    if (!this.modelInitialized) {
      throw new Error('LLM service not ready. Model initialization in progress.');
    }
  
    const startTime = Date.now();
    
    try {
      console.log(`🤖 Generating response with model: ${this.model}`);
      
      // Convert ChatMessage[] to a simple prompt string (like the working test)
      const prompt = this.buildPromptFromMessages(messages);
      console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
      
      // Use the SAME API that works in your direct test
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0.7'),
          top_p: parseFloat(process.env.DEFAULT_TOP_P || '0.9'),
          num_predict: parseInt(process.env.DEFAULT_MAX_TOKENS || '800')
        }
      }, { 
        timeout: 30000,  // 30 seconds should be plenty since direct test works in 4s
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const responseTime = Date.now() - startTime;
      console.log(`✅ LLM response generated in ${responseTime}ms`);
  
      return {
        content: response.data.response,  // Note: .response not .message.content
        responseTime: responseTime
      };
  
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ LLM generation error after ${responseTime}ms:`, error.message);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error(`LLM request timed out after ${responseTime}ms`);
      }
      
      throw new Error(`LLM Error: ${error.message}`);
    }
  }
  
  // Add this helper method to your LLMService class
  private buildPromptFromMessages(messages: ChatMessage[]): string {
    let prompt = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        prompt += `${message.content}\n\n`;
      } else if (message.role === 'user') {
        prompt += `User: ${message.content}\n\n`;
      } else if (message.role === 'assistant') {
        prompt += `Assistant: ${message.content}\n\n`;
      }
    }
    
    prompt += 'Assistant: ';  // Prompt for the assistant to respond
    return prompt;
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
            // For /api/generate, streaming uses .response not .message.content
            if (parsed.response) {
              yield parsed.response;
            }
            if (parsed.done) return;
          } catch (e) {
            continue;
          }
        }
      }
    }
  }

  async generateStreamResponse(messages: ChatMessage[]) {
    if (!this.modelInitialized) {
      throw new Error('LLM service not ready. Model initialization in progress.');
    }
  
    try {
      console.log(`🌊 Generating streaming response with model: ${this.model}`);
      
      // Convert ChatMessage[] to a simple prompt string
      const prompt = this.buildPromptFromMessages(messages);
      
      // Use the working /api/generate endpoint with streaming
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: true,  // Enable streaming
        options: { 
          temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0.7'),
          top_p: parseFloat(process.env.DEFAULT_TOP_P || '0.9'),
          num_predict: parseInt(process.env.DEFAULT_MAX_TOKENS || '800')
        }
      }, { 
        responseType: 'stream', 
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      return this.parseStreamResponse(response.data);
    } catch (error: any) {
      console.error(`❌ Stream generation error:`, error.message);
      throw new Error(`LLM Stream Error: ${error.message}`);
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

    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory.slice(-10));
    }

    messages.push({ role: 'user', content: userQuery });
    return messages;
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, { timeout: 8000 });
      return response.data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Failed to get available models:', error);
      return [];
    }
  }

  async pullModel(modelName: string): Promise<boolean> {
    try {
      await axios.post(`${this.ollamaUrl}/api/pull`, {
        name: modelName
      }, { timeout: 300000 });
      return true;
    } catch (error) {
      console.error(`Failed to pull model ${modelName}:`, error);
      return false;
    }
  }

  // Public method to check initialization status
  isReady(): boolean {
    return this.modelInitialized;
  }

  // Public method to force re-initialization
  async reinitialize(): Promise<void> {
    this.modelInitialized = false;
    await this.initializeModel();
  }
}