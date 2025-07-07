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

interface ChatMessage {
  content: string;
  context?: string;
}

interface ChatResponse {
  content: string;
  timestamp: number;
  message_id: string;
}

interface CodeRequest {
  code: string;
  language?: string;
  action: 'review' | 'explain' | 'debug' | 'optimize';
}

interface CodeResponse {
  result: string;
  suggestions?: string[];
  timestamp: number;
}

interface VoiceResponse {
  text: string;
  confidence?: number;
  language?: string;
  timestamp: number;
}

interface DocumentAnalysisResponse {
  summary: string;
  key_points: string[];
  content_type: string;
  timestamp: number;
}

interface ApiError {
  error: string;
  detail?: string;
  status_code?: number;
}

interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  size?: string;
}

interface ImageGenerationResponse {
  image_url?: string;
  image_data?: string; // Base64 encoded
  timestamp: number;
}

interface DocumentGenerationRequest {
  prompt: string;
  doc_type: 'article' | 'report' | 'essay' | 'letter' | 'memo';
  format: 'pdf' | 'docx' | 'txt';
  model?: string;
}

interface DocumentGenerationResponse {
  document_data: string; // Base64 encoded
  filename: string;
  content_type: string;
  timestamp: number;
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
        console.log('Telegram Web App authentication initialized');
      } else {
        console.warn('No Telegram Web App init data available');
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
        console.log('Development mode: Using mock authentication');
      } else {
        console.warn('No Telegram Web App environment detected');
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
  async validateAuth(): Promise<{ valid: boolean; user?: WebAppUser }> {
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

  // Code analysis
  async analyzeCode(request: CodeRequest): Promise<CodeResponse> {
    return this.makeRequest('/code', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Voice transcription
  async transcribeVoice(audioFile: File): Promise<VoiceResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    return this.makeFormDataRequest('/voice/transcribe', formData);
  }

  // Image analysis
  async analyzeImage(
    imageFile: File, 
    prompt: string = 'Analyze this image and describe what you see.'
  ): Promise<ChatResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('prompt', prompt);
    
    return this.makeFormDataRequest('/image/analyze', formData);
  }

  // Document analysis
  async analyzeDocument(documentFile: File): Promise<DocumentAnalysisResponse> {
    const formData = new FormData();
    formData.append('document', documentFile);
    
    return this.makeFormDataRequest('/document/analyze', formData);
  }

  // Image generation
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    return this.makeRequest('/image/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Document generation
  async generateDocument(request: DocumentGenerationRequest): Promise<DocumentGenerationResponse> {
    return this.makeRequest('/document/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // PDF analysis (specialized document analysis)
  async analyzePDF(pdfFile: File): Promise<DocumentAnalysisResponse> {
    const formData = new FormData();
    formData.append('pdf_file', pdfFile);
    
    return this.makeFormDataRequest('/pdf/analyze', formData);
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
  ChatMessage,
  ChatResponse,
  CodeRequest,
  CodeResponse,
  VoiceResponse,
  DocumentAnalysisResponse,
  ApiError,
  ImageGenerationRequest,
  ImageGenerationResponse,
  DocumentGenerationRequest,
  DocumentGenerationResponse,
};
