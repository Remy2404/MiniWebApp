import { useState, useEffect } from "react";
import api from "~/lib/api";

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  supports_images: boolean;
  max_tokens: number;
  capabilities: string[];
  emoji?: string;
  description?: string;
}

export function useModels() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true);
        const response = await api.getAvailableModels();
        
        // Map backend models to frontend format with additional UI properties
        const mappedModels = response.models.map((model) => ({
          ...model,
          emoji: getModelEmoji(model.id, model.provider),
          description: getModelDescription(model.id, model.provider),
        }));
        
        setModels(mappedModels);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch models:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch models");
        
        // Fallback to static models if API fails
        setModels(getFallbackModels());
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  return { models, isLoading, error };
}

// Helper function to get emoji for models
function getModelEmoji(modelId: string, provider: string): string {
  // Map model IDs to emojis
  const emojiMap: Record<string, string> = {
    "gemini-2.0-flash": "✨",
    "deepseek-r1-0528": "🧠",
    "anthropic/claude-3.5-sonnet": "🎭",
    "openai/gpt-4o": "🤖",
    "meta-llama/llama-3.3-70b-instruct": "🦙",
  };

  // Try exact match first
  if (emojiMap[modelId]) {
    return emojiMap[modelId];
  }

  // Fallback based on provider
  const providerEmojiMap: Record<string, string> = {
    "Google": "✨",
    "DeepSeek": "🧠", 
    "Anthropic": "🎭",
    "OpenAI": "🤖",
    "Meta": "🦙",
    "OpenRouter": "🌐",
  };

  return providerEmojiMap[provider] || "🤖";
}

// Helper function to get description for models
function getModelDescription(modelId: string, provider: string): string {
  const descriptionMap: Record<string, string> = {
    "gemini-2.0-flash": "Multimodal powerhouse with vision",
    "deepseek-r1-0528": "Advanced reasoning model", 
    "anthropic/claude-3.5-sonnet": "Creative and analytical",
    "openai/gpt-4o": "Versatile multimodal model",
    "meta-llama/llama-3.3-70b-instruct": "Open source powerhouse",
  };

  if (descriptionMap[modelId]) {
    return descriptionMap[modelId];
  }

  // Generate description based on capabilities
  return `${provider} AI model`;
}

// Fallback models when API is not available
function getFallbackModels(): ModelInfo[] {
  return [
    {
      id: "gemini-2.0-flash",
      name: "Gemini 2.0 Flash",
      provider: "Google",
      supports_images: true,
      max_tokens: 32000,
      capabilities: ["text", "vision", "code", "reasoning"],
      emoji: "✨",
      description: "Multimodal powerhouse with vision",
    },
    {
      id: "deepseek-r1-0528", 
      name: "DeepSeek R1",
      provider: "DeepSeek",
      supports_images: false,
      max_tokens: 32000,
      capabilities: ["text", "code", "reasoning", "math"],
      emoji: "🧠",
      description: "Advanced reasoning model",
    },
  ];
}
