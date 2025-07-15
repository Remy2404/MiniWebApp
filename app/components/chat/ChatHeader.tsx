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
    <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20 shadow-lg">
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Menu button and Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl opacity-20 blur animate-pulse" />
              </div>

              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Ploymind AI
                </h1>
                <p className="text-xs text-white/50 font-medium">
                  Your Intelligent Assistant
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Model Selector and Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={onToggleModelSelector}
                className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-2 sm:px-3 py-2 flex items-center gap-2 hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              >
                <span className="text-base sm:text-lg">
                  {safeModels.find((m) => m.id === selectedModel)
                    ?.emoji || "🤖"}
                </span>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-white/90 truncate max-w-[120px]">
                    {safeModels.find((m) => m.id === selectedModel)
                      ?.name || "Select Model"}
                  </div>
                  <div className="text-xs text-white/50">
                    {safeModels.find((m) => m.id === selectedModel)
                      ?.provider || "AI Model"}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-200 ${showModelSelector ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Connection Status */}
            <div
              className="flex items-center gap-1 p-2 rounded-lg bg-white/5"
              title={`Connection: ${connectionStatus}`}
            >
              {connectionStatus === "connected" && (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              )}
              {connectionStatus === "connecting" && (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              )}
              {connectionStatus === "error" && (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
            </div>

            <button
              onClick={onStartNewChat}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
              title="New Chat"
            >
              <RefreshCw className="w-5 h-5 text-white/70 group-hover:text-white transition-colors group-hover:rotate-180 duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Model Selector Dropdown */}
      {showModelSelector && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-w-md mx-auto z-30 shadow-2xl">
          <h3 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Choose AI Model
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {safeModels.map((model) => (
              <button
                key={model.id}
                onClick={() => onSelectModel(model.id)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                  selectedModel === model.id
                    ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-500/50 shadow-lg"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {model.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white/90 truncate">
                      {model.name}
                    </div>
                    <div className="text-xs text-white/60 truncate">
                      {model.provider} • {model.description}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {model.capabilities?.slice(0, 3).map((cap) => (
                        <span key={cap} className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/70">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedModel === model.id && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
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