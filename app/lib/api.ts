// API client for Telegram Mini Web App
// Handles authentication and communication with the backend

// Extend the Window interface to include Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        [key: string]: any;
      };
    };
  }
}

interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface AuthValidationResponse {
  valid: boolean;
  user?: WebAppUser;
  auth_date: number;
  timestamp: number;
  preferences?: {
    selected_model: string;
    settings: Record<string, any>;
    stats: Record<string, any>;
  };
  conversation_stats?: {
    has_history: boolean;
    last_activity?: number;
  };
}

interface ChatMessage {
  content: string;
  model?: string;
  context?: string;
}

interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  message_id: string;
  model_used?: string;
}

interface ChatHistoryResponse {
  messages: ChatHistoryMessage[];
  total_messages: number;
  user_id: number;
}

interface ChatResponse {
  content: string;
  timestamp: number;
  message_id: string;
  model_used: string;
}

interface VoiceResponse {
  text: string;
  confidence?: number;
  language?: string;
  ai_response?: string;
  model_used?: string;
  timestamp: number;
}

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  supports_images: boolean;
  max_tokens: number;
  capabilities: string[];
}

interface ModelsResponse {
  models: ModelInfo[];
  default_model: string;
  timestamp: number;
}

interface ApiError {
  error: string;
  detail?: string;
  status_code?: number;
}

class TelegramWebAppAPI {
  private baseUrl: string;
  private authHeader: string | null = null;

  constructor(baseUrl: string = '/api/webapp') {
    this.baseUrl = baseUrl;
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Get Telegram Web App init data
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      const initData = webApp.initData;
      
      if (initData) {
        this.authHeader = `tma ${initData}`;
        console.log('✅ Telegram Web App authentication initialized');
      } else {
        console.warn('⚠️ No Telegram Web App init data available - using development mode');
      }
    } else {
      // Development mode fallback - create a mock auth header
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        // Create a basic development auth token
        const devAuthData = {
          user: {
            id: 123456789,
            first_name: "Dev",
            last_name: "User",
            username: "devuser"
          },
          auth_date: Math.floor(Date.now() / 1000),
          hash: "dev_hash_placeholder"
        };
        
        // Create a simple query string for development
        const queryString = Object.entries(devAuthData)
          .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
          .join('&');
          
        this.authHeader = `tma ${queryString}`;
        console.log('🔧 Development mode: Using mock authentication');
      } else {
        console.warn('❌ No Telegram Web App environment detected and not in development mode');
      }
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        headers = { ...headers, ...(options.headers as Record<string, string>) };
      }
    }
    if (this.authHeader) {
      headers['Authorization'] = this.authHeader;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Unknown error',
          status_code: response.status
        }));
        
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private async makeFormDataRequest<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {};
    
    if (this.authHeader) {
      headers['Authorization'] = this.authHeader;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Unknown error',
          status_code: response.status
        }));
        
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication validation
  async validateAuth(): Promise<AuthValidationResponse> {
    return this.makeRequest('/auth/validate', {
      method: 'POST',
    });
  }

  // Chat functionality
  async sendChatMessage(message: ChatMessage): Promise<ChatResponse> {
    return this.makeRequest('/chat', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // Get chat history
  async getChatHistory(limit: number = 50, model?: string): Promise<ChatHistoryResponse> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (model) {
      params.append('model', model);
    }
    
    return this.makeRequest(`/chat/history?${params}`, {
      method: 'GET',
    });
  }

  // Clear chat history
  async clearChatHistory(model?: string): Promise<{ success: boolean; message: string; timestamp: number }> {
    const params = model ? new URLSearchParams({ model }) : '';
    const url = `/chat/history${params ? `?${params}` : ''}`;
    
    return this.makeRequest(url, {
      method: 'DELETE',
    });
  }

  // Get available models
  async getAvailableModels(): Promise<ModelsResponse> {
    return this.makeRequest('/models', {
      method: 'GET',
    });
  }

  // Select AI model
  async selectModel(modelId: string): Promise<{ success: boolean; selected_model: string; message: string; timestamp: number }> {
    return this.makeRequest('/models/select', {
      method: 'POST',
      body: JSON.stringify({ model_id: modelId }),
    });
  }

  // Get available models (alias for getAvailableModels)
  async getModels(): Promise<ModelsResponse> {
    return this.getAvailableModels();
  }

  // Voice transcription with optional AI processing
  async transcribeVoice(
    audioFile: File, 
    model?: string, 
    processWithAI: boolean = true
  ): Promise<VoiceResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    if (model) {
      formData.append('model', model);
    }
    formData.append('process_with_ai', processWithAI.toString());
    
    return this.makeFormDataRequest('/voice/transcribe', formData);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: number }> {
    return this.makeRequest('/health');
  }

  // Utility method to check if authentication is available
  isAuthenticated(): boolean {
    return this.authHeader !== null;
  }

  // Method to manually set auth header (for testing)
  setAuthHeader(authHeader: string): void {
    this.authHeader = authHeader;
  }
}

// Create singleton instance
const api = new TelegramWebAppAPI();

export default api;
export type {
  WebAppUser,
  AuthValidationResponse,
  ChatMessage,
  ChatHistoryMessage,
  ChatHistoryResponse,
  ChatResponse,
  VoiceResponse,
  ModelInfo,
  ModelsResponse,
  ApiError,
};
