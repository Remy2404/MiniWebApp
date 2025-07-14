import type { ModelConfig } from "./types";

// Available AI models with their configurations
export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    emoji: "✨",
    provider: "Google",
    description: "Multimodal powerhouse with vision",
    capabilities: ["text", "vision", "code", "reasoning"],
  },
  {
    id: "deepseek-r1-0528",
    name: "DeepSeek R1",
    emoji: "🧠",
    provider: "DeepSeek",
    description: "Advanced reasoning model",
    capabilities: ["text", "code", "reasoning", "math"],
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    emoji: "🎭",
    provider: "Anthropic",
    description: "Creative and analytical",
    capabilities: ["text", "code", "reasoning", "creative"],
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4 Omni",
    emoji: "🤖",
    provider: "OpenAI",
    description: "Versatile multimodal model",
    capabilities: ["text", "vision", "code", "creative"],
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    emoji: "🦙",
    provider: "Meta",
    description: "Open source powerhouse",
    capabilities: ["text", "code", "reasoning"],
  },
];