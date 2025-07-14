// Enhanced Message List with interactive message bubbles
import { forwardRef } from "react";
import { Bot, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import type { Message } from "./types";

interface EnhancedMessageListProps {
  messages: Message[];
  isLoading: boolean;
  className?: string;
  onMessageCopy?: (content: string) => void;
  onMessageEdit?: (messageId: string) => void;
  onMessageRegenerate?: (messageId: string) => void;
  onMessageSpeak?: (content: string) => void;
  onMessageLike?: (messageId: string) => void;
  onMessageSave?: (messageId: string) => void;
  onMessageDelete?: (messageId: string) => void;
}

const EnhancedMessageList = forwardRef<HTMLDivElement, EnhancedMessageListProps>(
  ({ 
    messages, 
    isLoading, 
    className = "",
    onMessageCopy,
    onMessageEdit,
    onMessageRegenerate,
    onMessageSpeak,
    onMessageLike,
    onMessageSave,
    onMessageDelete
  }, ref) => {
    return (
      <div className={`flex-1 overflow-y-auto p-4 ${className}`}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white/90 mb-2">
                Welcome to Ploymind AI
              </h3>
              <p className="text-white/60 text-sm max-w-md mx-auto">
                Start a conversation with your AI assistant. Ask questions, get help with code, 
                or just have a chat!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={onMessageCopy}
                onEdit={onMessageEdit}
                onRegenerate={onMessageRegenerate}
                onSpeak={onMessageSpeak}
                onLike={onMessageLike}
                onSave={onMessageSave}
                onDelete={onMessageDelete}
              />
            ))
          )}
          
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
          
          <div ref={ref} />
        </div>
      </div>
    );
  }
);

EnhancedMessageList.displayName = "EnhancedMessageList";

export default EnhancedMessageList;
