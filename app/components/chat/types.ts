export interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  model: string;
  messageCount: number;
}

export interface VoiceResponse {
  text: string;
  confidence?: number;
  language?: string;
  timestamp: number;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  model?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  emoji: string;
  provider: string;
  description: string;
  capabilities: string[];
}

export interface ModelInfo {
  id: string;
  name: string;
  emoji: string;
  provider: string;
  description: string;
  capabilities: string[];
}

export type ConnectionStatus = "connected" | "connecting" | "error";