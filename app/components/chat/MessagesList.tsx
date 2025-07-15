import { useRef, useEffect } from "react";
import { Bot, Loader2 } from "lucide-react";
import { MessageComponent } from "./MessageComponent";
import type { Message } from "./types";

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  copiedCode: string | null;
  lastAssistantMessage: Message | null;
  isRegenerating: boolean;
  onCopyToClipboard: (code: string, codeId: string) => void;
  onRegenerateMessage: () => void;
}

export function MessagesList({
  messages,
  isLoading,
  copiedCode,
  lastAssistantMessage,
  isRegenerating,
  onCopyToClipboard,
  onRegenerateMessage,
}: MessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-2 py-3 sm:px-4 md:px-6 lg:px-8 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
      <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
        {messages.map((message, index) => (
          <div 
            key={message.id}
            className="animate-in slide-in-from-bottom-4 duration-500 ease-out"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <MessageComponent
              message={message}
              isLastAssistantMessage={lastAssistantMessage?.id === message.id}
              copiedCode={copiedCode}
              isRegenerating={isRegenerating}
              isLoading={isLoading}
              onCopyToClipboard={onCopyToClipboard}
              onRegenerateMessage={onRegenerateMessage}
            />
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 sm:gap-3 md:gap-4 justify-start animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg relative">
              <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl opacity-20 blur animate-pulse" />
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-3 sm:p-4 md:p-5 shadow-lg max-w-xs sm:max-w-sm md:max-w-md">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs sm:text-sm text-white/70 font-medium">Thinking...</span>
              </div>
              <div className="mt-2 sm:mt-3 text-xs text-white/50">
                Processing your request with AI
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-2 sm:h-4" />
      </div>
    </div>
  );
}