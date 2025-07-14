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
    <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-4">
      {error && (
        <div className="max-w-4xl mx-auto mb-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-3 flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message Ploymind AI..."
            className="flex-1 bg-transparent text-white placeholder:text-white/50 border-none outline-none resize-none max-h-32 min-h-[24px]"
            rows={1}
            style={{
              height: "auto",
              minHeight: "24px",
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

          {/* Send Button */}
          <button
            onClick={onSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl transition-all ${
              input.trim() && !isLoading
                ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            } border border-white/20`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}