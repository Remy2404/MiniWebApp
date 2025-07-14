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
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <MessageComponent
            key={message.id}
            message={message}
            isLastAssistantMessage={lastAssistantMessage?.id === message.id}
            copiedCode={copiedCode}
            isRegenerating={isRegenerating}
            isLoading={isLoading}
            onCopyToClipboard={onCopyToClipboard}
            onRegenerateMessage={onRegenerateMessage}
          />
        ))}

        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-sm text-white/70">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}