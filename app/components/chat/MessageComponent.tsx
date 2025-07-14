import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Bot, User, Copy, Check, RotateCcw, Loader2 } from "lucide-react";
import type { Message } from "./types";

interface MessageComponentProps {
  message: Message;
  isLastAssistantMessage?: boolean;
  copiedCode: string | null;
  isRegenerating: boolean;
  isLoading: boolean;
  onCopyToClipboard: (code: string, codeId: string) => void;
  onRegenerateMessage?: () => void;
}

export function MessageComponent({
  message,
  isLastAssistantMessage = false,
  copiedCode,
  isRegenerating,
  isLoading,
  onCopyToClipboard,
  onRegenerateMessage,
}: MessageComponentProps) {
  return (
    <div className="group">
      <div
        className={`flex gap-4 ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        {message.role === "assistant" && (
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}

        <div
          className={`max-w-[85%] ${
            message.role === "user" ? "order-first" : ""
          }`}
        >
          <div
            className={`rounded-2xl p-4 ${
              message.role === "user"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "bg-black/30 backdrop-blur-sm border border-white/10 text-white/90"
            }`}
          >
            {message.role === "assistant" ? (
              <div
                className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none
                prose-headings:text-white prose-p:text-white/90 prose-strong:text-white
                prose-code:text-blue-300 prose-code:bg-black/30 prose-code:px-1 prose-code:rounded
                prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10
                prose-blockquote:border-l-blue-400 prose-blockquote:text-white/80
                prose-ul:text-white/90 prose-ol:text-white/90
                prose-li:text-white/90 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                prose-table:text-white/90 prose-thead:text-white prose-tbody:text-white/80
                prose-th:border-white/20 prose-td:border-white/20"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    code: ({
                      node,
                      inline,
                      className,
                      children,
                      ...props
                    }: any) => {
                      const match = /language-(\w+)/.exec(
                        className || ""
                      );
                      const language = match ? match[1] : '';
                      const codeString = String(children).replace(/\n$/, '');
                      const codeId = `code-${message.id}-${Math.random().toString(36).substr(2, 9)}`;
                      
                      return !inline && match ? (
                        <div className="relative group my-4">
                          <div className="flex items-center justify-between bg-black/70 border border-white/10 rounded-t-lg px-4 py-2">
                            <span className="text-xs text-white/60 font-medium uppercase">{language}</span>
                            <button
                              onClick={() => onCopyToClipboard(codeString, codeId)}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded transition-colors"
                            >
                              {copiedCode === codeId ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="bg-black/50 border border-white/10 border-t-0 rounded-b-lg p-4 overflow-x-auto m-0">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      ) : (
                        <code
                          className="bg-black/30 px-1 py-0.5 rounded text-blue-300"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    table: ({ children, ...props }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border-collapse border border-white/20 rounded-lg" {...props}>
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children, ...props }) => (
                      <th className="border border-white/20 bg-white/10 px-4 py-2 text-left font-semibold" {...props}>
                        {children}
                      </th>
                    ),
                    td: ({ children, ...props }) => (
                      <td className="border border-white/20 px-4 py-2" {...props}>
                        {children}
                      </td>
                    ),
                    blockquote: ({ children, ...props }) => (
                      <blockquote className="border-l-4 border-blue-400 pl-4 my-4 italic text-white/80 bg-blue-500/10 py-2 rounded-r" {...props}>
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>{message.timestamp.toLocaleTimeString()}</span>
              {message.model && <span>• {message.model}</span>}
            </div>
            
            {/* Regenerate button for last assistant message */}
            {message.role === "assistant" && isLastAssistantMessage && onRegenerateMessage && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onRegenerateMessage}
                  disabled={isLoading || isRegenerating}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Regenerate response"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3 h-3" />
                      Regenerate
                    </>
                  )}
                </button>
              </div>
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
  );
}