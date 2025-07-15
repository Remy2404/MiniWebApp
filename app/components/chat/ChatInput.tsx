import { useRef } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  error: string | null;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function ChatInput({
  input,
  isLoading,
  error,
  onInputChange,
  onSend,
  onKeyDown,
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="sticky bottom-0 bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent p-3 sm:p-6">
      {error && (
        <div className="max-w-4xl mx-auto mb-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 text-red-200 text-sm shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="font-medium">Error:</span>
            {error}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-3 sm:p-4 flex items-end gap-3 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:border-white/30">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Message Ploymind AI..."
              className="w-full bg-transparent text-white placeholder:text-white/50 border-none outline-none resize-none max-h-32 min-h-[28px] text-sm sm:text-base leading-relaxed"
              rows={1}
              style={{
                height: "auto",
                minHeight: "28px",
                maxHeight: "128px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(
                  target.scrollHeight,
                  128
                )}px`;
              }}
            />
            
            {/* Character count indicator for long messages */}
            {input.length > 100 && (
              <div className="absolute -top-6 right-0 text-xs text-white/40">
                {input.length} characters
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={onSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 group ${
              input.trim() && !isLoading
                ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            } border border-white/20 hover:border-white/30`}
            title={isLoading ? "Sending..." : "Send message"}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
            )}
          </button>
        </div>
        
        {/* Input hints */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-white/30">
          <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
          <span className="sm:hidden">Tap to send</span>
        </div>
      </div>
    </div>
  );
}