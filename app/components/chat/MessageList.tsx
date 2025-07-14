// Message List Component - Displays conversation messages
import { forwardRef } from "react";
import { Bot, User, Loader2 } from "lucide-react";
import type { Message } from "./types";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  className?: string;
}

const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, isLoading, className = "" }, ref) => {
    return (
      <div className={`flex-1 overflow-y-auto p-4 ${className}`}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="group">
              <div className={`flex gap-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}>
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[85%] ${
                  message.role === "user" ? "order-first" : ""
                }`}>
                  <div
                    className={`rounded-2xl p-4 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-black/30 backdrop-blur-sm border border-white/10 text-white/90"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.model && message.role === "assistant" && (
                      <>
                        <span>•</span>
                        <span>{message.model}</span>
                      </>
                    )}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
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
          
          <div ref={ref} />
        </div>
      </div>
    );
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
