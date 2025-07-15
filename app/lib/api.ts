// API client for Telegram Mini Web App
// Handles authentication and communication with the backend

import { getApiUrl, isDevelopment } from './config';

// Extend the Window interface to include Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
          };
          auth_date?: number;
          hash?: string;
          query_id?: string;
          start_param?: string;
        };
        version?: string;
        platform?: string;
        colorScheme?: 'light' | 'dark';
        themeParams?: Record<string, string>;
        isExpanded?: boolean;
        viewportHeight?: number;
        viewportStableHeight?: number;
        ready?: () => void;
        expand?: () => void;
        close?: () => void;
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

  constructor(baseUrl?: string) {
    // Determine the correct base URL based on environment
    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else {
      // Use the secure configuration-based API URL
      this.baseUrl = getApiUrl();
    }
    
    // Only initialize auth on client side to prevent server-side errors
    if (typeof window !== 'undefined') {
      // Always log API URL for debugging production issues
      console.log(`🔗 API Base URL: ${this.baseUrl}`);
      console.log(`🔧 Environment: ${isDevelopment() ? 'Development' : 'Production'}`);
      this.initializeAuth();
    }
  }

  private initializeAuth(): void {
    // Get Telegram Web App init data
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      const initData = webApp.initData;
      
      // Enhanced debugging for production issues
      console.log('🔍 Telegram WebApp detection:', {
        hasWindow: typeof window !== 'undefined',
        hasTelegram: !!window.Telegram,
        hasWebApp: !!window.Telegram?.WebApp,
        hasInitData: !!initData,
        initDataLength: initData?.length || 0,
        webAppUser: webApp.initDataUnsafe?.user?.id || 'no-user',
        platform: webApp.platform || 'unknown',
        version: webApp.version || 'unknown'
      });
      
      if (initData && initData.length > 0) {
        // Use the raw initData directly - this is what Telegram validates
        this.authHeader = `tma ${initData}`;
        console.log('✅ Telegram Web App authentication initialized with initData length:', initData.length);
        
        // Additional validation - check if initData contains required fields
        const params = new URLSearchParams(initData);
        const hasAuth = params.has('auth_date') && params.has('hash');
        console.log('🔐 InitData validation:', {
          hasAuthDate: params.has('auth_date'),
          hasHash: params.has('hash'),
          hasUser: params.has('user'),
          isValid: hasAuth
        });
        
        if (!hasAuth) {
          console.warn('⚠️ InitData missing required authentication fields');
        }
        
        return;
      } else {
        console.warn('⚠️ No Telegram Web App init data available or empty');
        
        // Try alternative approaches for development/testing
        if (webApp.initDataUnsafe?.user) {
          console.log('🔄 InitDataUnsafe available:', {
            userId: webApp.initDataUnsafe.user.id,
            firstName: webApp.initDataUnsafe.user.first_name,
            authDate: webApp.initDataUnsafe.auth_date
          });
          
          // For development, try to construct basic initData from initDataUnsafe
          if (isDevelopment()) {
            const user = webApp.initDataUnsafe.user;
            const authDate = webApp.initDataUnsafe.auth_date || Math.floor(Date.now() / 1000);
            const mockInitData = `user=${encodeURIComponent(JSON.stringify(user))}&auth_date=${authDate}&hash=dev_hash`;
            this.authHeader = `tma ${mockInitData}`;
            console.log('🔧 Development: Using constructed initData from initDataUnsafe');
            return;
          }
        }
        
        if (isDevelopment()) {
          console.warn('⚠️ Falling back to development mode');
        } else {
          // In production, log warning but don't throw error to prevent SSR issues
          console.warn('❌ This app should be opened from Telegram. Telegram WebApp initData is missing.');
          return; // Return early, don't throw
        }
      }
    } else {
      // Not running inside Telegram WebApp
      console.log('🔍 Telegram WebApp not detected:', {
        hasWindow: typeof window !== 'undefined',
        hasTelegram: typeof window !== 'undefined' && !!window.Telegram,
        hasWebApp: typeof window !== 'undefined' && !!window.Telegram?.WebApp
      });
      
      if (isDevelopment()) {
        // Development mode fallback - extract user ID dynamically
        let userId = this.extractUserIdFromTelegramData() || 123456789; // Dynamic extraction with fallback
        // Create a development auth token with dynamic user ID
        const devAuthData = {
          user: {
            id: userId,
            first_name: "User",
            last_name: `${userId}`,
            username: `user${userId}`
          },
          auth_date: Math.floor(Date.now() / 1000),
          hash: "dev_hash_placeholder"
        };
        // Create a simple query string for development
        const queryString = Object.entries(devAuthData)
          .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
          .join('&');
        this.authHeader = `tma ${queryString}`;
        console.log(`🔧 Development mode: Using mock authentication for user ${userId}`);
      } else {
        // Production: log warning but don't throw to prevent SSR crashes
        console.warn('❌ This app must be opened from Telegram. Telegram WebApp context is missing.');
        return; // Return early, don't throw
      }
    }
  }

  // Public method to reinitialize auth when needed
  public reinitializeAuth(): void {
    if (typeof window !== 'undefined') {
      console.log('🔄 Reinitializing Telegram WebApp authentication...');
      this.initializeAuth();
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    let headers: Record<string, string> = { 
      'Content-Type': 'application/json',
      // Add CORS headers for cross-origin requests
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
    
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
      if (isDevelopment()) {
        console.log('🔐 Authorization header set:', this.authHeader.substring(0, 20) + '...');
      } else {
        console.log('🔐 Authorization header set with length:', this.authHeader.length);
      }
    } else {
      // If no auth header is available, we might be in SSR or missing Telegram context
      if (typeof window !== 'undefined') {
        console.warn('⚠️ No authorization header available. This might cause API request failures.');
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
      // Add mode for CORS
      mode: 'cors',
      credentials: 'omit', // Don't send cookies for cross-origin requests
    };

    try {
      if (isDevelopment()) {
        console.log(`📡 Making API request to: ${url}`);
      }
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData: ApiError;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            error: `HTTP ${response.status} - ${response.statusText}`,
            status_code: response.status
          };
        }
        
        if (isDevelopment()) {
          console.error(`❌ API Error (${response.status}):`, errorData);
        }
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (isDevelopment()) {
        console.log(`✅ API Success for ${endpoint}`);
      }
      return data;
    } catch (error) {
      if (isDevelopment()) {
        console.error(`💥 API request failed for ${endpoint}:`, error);
      }
      
      // Provide more helpful error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to the backend server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  private async makeFormDataRequest<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      // Don't set Content-Type for FormData, let the browser set it with boundary
    };
    
    if (this.authHeader) {
      headers['Authorization'] = this.authHeader;
    }

    try {
      if (isDevelopment()) {
        console.log(`📡 Making form data request to: ${url}`);
      }
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        let errorData: ApiError;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            error: `HTTP ${response.status} - ${response.statusText}`,
            status_code: response.status
          };
        }
        
        if (isDevelopment()) {
          console.error(`❌ Form Data API Error (${response.status}):`, errorData);
        }
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (isDevelopment()) {
        console.log(`✅ Form Data API Success for ${endpoint}`);
      }
      return data;
    } catch (error) {
      if (isDevelopment()) {
        console.error(`💥 Form data request failed for ${endpoint}:`, error);
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to the backend server. Please check your internet connection.');
      }
      
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

  // Initialize and test the API connection
  async initialize(): Promise<boolean> {
    try {
      if (isDevelopment()) {
        console.log('🚀 Initializing API connection...');
      }
      await this.healthCheck();
      if (isDevelopment()) {
        console.log('✅ API connection successful');
      }
      return true;
    } catch (error) {
      if (isDevelopment()) {
        console.error('❌ API connection failed:', error);
      }
      return false;
    }
  }

  // Get current user ID (useful for debugging)
  getCurrentUserId(): number | null {
    if (!this.authHeader) return null;
    
    try {
      const initData = this.authHeader.replace('tma ', '');
      
      // Handle development mode
      if (initData.includes('dev_hash_placeholder')) {
        const params = new URLSearchParams(initData);
        const userParam = params.get('user');
        if (userParam) {
          const userData = JSON.parse(decodeURIComponent(userParam));
          return userData.id;
        }
        return null;
      }
      
      // Handle production Telegram WebApp init data
      const params = new URLSearchParams(initData);
      const userParam = params.get('user');
      
      if (userParam) {
        const userData = JSON.parse(decodeURIComponent(userParam));
        return userData.id;
      }
      
      // Alternative: try to parse as URL-encoded data
      const decodedData = decodeURIComponent(initData);
      const userMatch = decodedData.match(/user=([^&]+)/);
      if (userMatch) {
        const userData = JSON.parse(userMatch[1]);
        return userData.id;
      }
      
    } catch (error) {
      console.warn('Could not extract user ID from auth header:', error);
    }
    
    return null;
  }

  // Extract user ID from Telegram WebApp launch URL or init data
  private extractUserIdFromTelegramData(): number | null {
    if (typeof window === 'undefined') return null;
    
    try {
      // First try to get from Telegram WebApp
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        return window.Telegram.WebApp.initDataUnsafe.user.id;
      }
      
      // Try from URL parameters (when launched from Telegram)
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get('user');
      
      if (userParam) {
        const userData = JSON.parse(decodeURIComponent(userParam));
        return userData.id;
      }
      
      // Try from hash parameters
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashUserParam = hashParams.get('user');
      
      if (hashUserParam) {
        const userData = JSON.parse(decodeURIComponent(hashUserParam));
        return userData.id;
      }
      
    } catch (error) {
      console.warn('Failed to extract user ID from Telegram data:', error);
    }
    
    return null;
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