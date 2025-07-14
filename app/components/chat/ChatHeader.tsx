import {
  Menu,
  Sparkles,
  ChevronDown,
  CheckCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useModels } from "~/hooks/useModels";
import type { ConnectionStatus } from "./types";

interface ChatHeaderProps {
  selectedModel: string;
  connectionStatus: ConnectionStatus;
  showModelSelector: boolean;
  onToggleSidebar: () => void;
  onToggleModelSelector: () => void;
  onSelectModel: (modelId: string) => void;
  onStartNewChat: () => void;
}

export function ChatHeader({
  selectedModel,
  connectionStatus,
  showModelSelector,
  onToggleSidebar,
  onToggleModelSelector,
  onSelectModel,
  onStartNewChat,
}: ChatHeaderProps) {
  const { models } = useModels();
  
  // Ensure models is always an array to prevent errors
  const safeModels = models || [];

  return (
    <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Menu button and Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>

            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ploymind AI
              </h1>
              <p className="text-xs text-white/60">
                Your Intelligent Assistant
              </p>
            </div>
          </div>

          {/* Right side - Model Selector and Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={onToggleModelSelector}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 flex items-center gap-2 hover:bg-white/20 transition-all"
              >
                <span className="text-lg">
                  {safeModels.find((m) => m.id === selectedModel)
                    ?.emoji || "🤖"}
                </span>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">
                    {safeModels.find((m) => m.id === selectedModel)
                      ?.name || "Select Model"}
                  </div>
                  <div className="text-xs text-white/60">
                    {safeModels.find((m) => m.id === selectedModel)
                      ?.provider || "AI Model"}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Connection Status */}
            <div
              className="flex items-center gap-1"
              title={`Connection: ${connectionStatus}`}
            >
              {connectionStatus === "connected" && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
              {connectionStatus === "connecting" && (
                <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
              )}
              {connectionStatus === "error" && (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
            </div>

            <button
              onClick={onStartNewChat}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="New Chat"
            >
              <RefreshCw className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>
      </div>

      {/* Model Selector Dropdown */}
      {showModelSelector && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-w-md mx-auto z-30 shadow-2xl">
          <h3 className="text-sm font-semibold text-white/90 mb-3">
            Choose AI Model
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => onSelectModel(model.id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selectedModel === model.id
                    ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-500/50"
                    : "bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{model.emoji}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white/90">
                      {model.name}
                    </div>
                    <div className="text-xs text-white/60">
                      {model.provider} • {model.description}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {model.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="text-xs bg-white/10 px-2 py-0.5 rounded"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedModel === model.id && (
                    <div className="flex flex-col items-center">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-blue-400 mt-1">
                        Active
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}