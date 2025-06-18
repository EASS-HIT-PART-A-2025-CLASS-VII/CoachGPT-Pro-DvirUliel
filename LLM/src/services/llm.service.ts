// Fixed llm.service.ts - Singleton Pattern Implementation
import axios, { AxiosResponse } from 'axios';
import { ChatMessage } from '../types';

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
    stop?: string[];
  };
}

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class LLMService {
  private static instance: LLMService;
  private ollamaUrl: string;
  private model: string;
  private healthCheckCache: { healthy: boolean; lastCheck: number } = { healthy: false, lastCheck: 0 };
  private modelInitialized: boolean = false;
  private initializationInProgress: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private readonly CACHE_TTL = 10000; // 10 seconds cache
  private readonly REQUEST_TIMEOUT = parseInt(process.env.LLM_TIMEOUT || '70000');
  private readonly HEALTH_TIMEOUT = 10000;

  private constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2:3b';
    
    console.log(`🚀 LLM Service initialized:`, {
      url: this.ollamaUrl,
      model: this.model,
      timeout: this.REQUEST_TIMEOUT
    });
  }

  // Singleton pattern - ensures only one instance
  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  // Initialize and return the same promise if already initializing
  public async initialize(): Promise<void> {
    if (this.modelInitialized) {
      return Promise.resolve();
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initializeModel();
    return this.initializationPromise;
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
      
      // Test generation to warm up the model
      await this.warmUpModel();
      
      this.modelInitialized = true;
      console.log(`✅ LLM service initialized successfully`);
      
    } catch (error: any) {
      console.error(`❌ LLM service initialization failed:`, error.message);
      throw error; // Re-throw to handle in server startup
    } finally {
      this.initializationInProgress = false;
    }
  }

  private async waitForOllama(maxRetries: number = 30): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await axios.get(`${this.ollamaUrl}/api/tags`, { 
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        });
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
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: this.HEALTH_TIMEOUT
      });
      const models = response.data?.models || [];
      const modelExists = models.some((model: any) => {
        const modelName = model.name || '';
        return modelName === this.model || modelName.startsWith(this.model.split(':')[0]);
      });

      if (modelExists) {
        console.log(`✅ Model ${this.model} already exists`);
        return;
      }

      console.log(`📥 Pulling model: ${this.model} (this may take several minutes...)`);
      
      // Use streaming endpoint for progress updates
      const pullResponse = await axios.post(`${this.ollamaUrl}/api/pull`, {
        name: this.model,
        stream: false
      }, {
        timeout: 600000, // 10 minutes for model download
        validateStatus: (status) => status < 500
      });

      if (pullResponse.status === 200) {
        console.log(`✅ Model ${this.model} pulled successfully`);
      } else {
        throw new Error(`Failed to pull model: ${pullResponse.status}`);
      }
      
    } catch (error: any) {
      console.error(`❌ Error ensuring model exists:`, error.message);
      throw error;
    }
  }

  private async warmUpModel(): Promise<void> {
    try {
      console.log(`🔥 Warming up model ${this.model}...`);
      
      const warmupRequest: OllamaGenerateRequest = {
        model: this.model,
        prompt: 'Hello',
        stream: false,
        options: {
          num_predict: 5,
          temperature: 0.1
        }
      };

      const response = await axios.post(`${this.ollamaUrl}/api/generate`, warmupRequest, {
        timeout: 30000, // 30s for warmup
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 200 && response.data.response) {
        console.log(`✅ Model warmed up successfully`);
      }
    } catch (error: any) {
      console.warn(`⚠️ Model warmup failed (non-critical):`, error.message);
    }
  }

  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Use cache if available
    if (now - this.healthCheckCache.lastCheck < this.CACHE_TTL) {
      return this.healthCheckCache.healthy;
    }

    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: this.HEALTH_TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status !== 200) {
        throw new Error(`Ollama API returned status ${response.status}`);
      }

      const models = response.data?.models || [];
      const modelAvailable = models.some((model: any) => {
        const modelName = model.name || '';
        return modelName === this.model || modelName.startsWith(this.model.split(':')[0]);
      });

      const healthy = modelAvailable && this.modelInitialized;
      
      this.healthCheckCache = { healthy, lastCheck: now };
      return healthy;

    } catch (error: any) {
      console.error(`❌ Health check failed:`, error.message);
      this.healthCheckCache = { healthy: false, lastCheck: now };
      return false;
    }
  }

  async generateResponse(messages: ChatMessage[]) {
    if (!this.modelInitialized) {
      throw new Error('LLM service not ready. Model initialization in progress.');
    }

    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      console.log(`🤖 [${requestId}] Starting generation with model: ${this.model}`);
      
      const prompt = this.buildSimplePrompt(messages);
      
      const requestPayload: OllamaGenerateRequest = {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0.7'),
          top_p: parseFloat(process.env.DEFAULT_TOP_P || '0.9'),
          num_predict: parseInt(process.env.DEFAULT_MAX_TOKENS || '200')
        }
      };

      console.log(`🚀 [${requestId}] Sending request to Ollama`);

      const response: AxiosResponse<OllamaGenerateResponse> = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        requestPayload,
        { 
          timeout: this.REQUEST_TIMEOUT,
          headers: {
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status < 500
        }
      );

      const responseTime = Date.now() - startTime;

      if (response.status !== 200) {
        throw new Error(`Ollama returned status ${response.status}: ${JSON.stringify(response.data)}`);
      }

      if (!response.data.response) {
        throw new Error('No response content from Ollama');
      }

      console.log(`✅ [${requestId}] Success in ${responseTime}ms`);

      return {
        content: response.data.response,
        responseTime: responseTime
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      console.error(`❌ [${requestId}] Failed after ${responseTime}ms:`, {
        error: error.message,
        code: error.code
      });

      if (error.code === 'ECONNABORTED') {
        throw new Error(`Request timed out after ${responseTime}ms`);
      }
      
      throw new Error(`LLM Error: ${error.message}`);
    }
  }

  private buildSimplePrompt(messages: ChatMessage[]): string {
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage) {
      return "Hello";
    }
    
    const prompt = `You are CoachGPT Pro, a fitness coach. Give helpful, concise advice (2-3 sentences).

User: ${lastMessage.content}

Coach:`;
    
    return prompt;
  }

  async generateStreamResponse(messages: ChatMessage[]) {
    if (!this.modelInitialized) {
      throw new Error('LLM service not ready. Model initialization in progress.');
    }
  
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      console.log(`🌊 [${requestId}] Starting streaming generation`);
      
      const prompt = this.buildSimplePrompt(messages);
      
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: true,
        options: { 
          temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0.7'),
          num_predict: parseInt(process.env.DEFAULT_MAX_TOKENS || '200')
        }
      }, { 
        responseType: 'stream', 
        timeout: this.REQUEST_TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      });
  
      return this.parseStreamResponse(response.data);
    } catch (error: any) {
      console.error(`❌ [${requestId}] Stream generation error:`, error.message);
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

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, { 
        timeout: this.HEALTH_TIMEOUT 
      });
      return response.data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Failed to get available models:', error);
      return [];
    }
  }

  async pullModel(modelName: string): Promise<boolean> {
    try {
      console.log(`📥 Pulling model: ${modelName}`);
      await axios.post(`${this.ollamaUrl}/api/pull`, {
        name: modelName,
        stream: false
      }, { timeout: 600000 });
      console.log(`✅ Model ${modelName} pulled successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to pull model ${modelName}:`, error);
      return false;
    }
  }

  isReady(): boolean {
    return this.modelInitialized;
  }

  async reinitialize(): Promise<void> {
    this.modelInitialized = false;
    this.initializationPromise = null;
    await this.initialize();
  }

  async testGeneration(): Promise<void> {
    try {
      console.log('🧪 Running LLM service test...');
      
      const testMessages: ChatMessage[] = [
        { role: 'user', content: 'Hi' }
      ];

      const response = await this.generateResponse(testMessages);
      
      console.log('✅ Test generation successful:', {
        responseLength: response.content.length,
        duration: response.responseTime
      });
      
    } catch (error: any) {
      console.error('❌ Test generation failed:', error.message);
      throw error;
    }
  }
}