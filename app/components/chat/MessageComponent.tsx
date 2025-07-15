import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { User, Copy, Check, RotateCcw, Loader2 } from "lucide-react";
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
        className={`flex gap-3 sm:gap-4 ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        {/* Bot icon removed for mobile devices */}

        <div
          className={`max-w-[88%] sm:max-w-[85%] md:max-w-[80%] ${
            message.role === "user" ? "order-first" : ""
          }`}
        >
          <div
            className={`rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${
              message.role === "user"
                ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white"
                : "bg-white/5 backdrop-blur-xl border border-white/20 text-white/90"
            }`}
          >
            {message.role === "assistant" ? (
              <div
                className="text-sm sm:text-base leading-relaxed prose prose-invert prose-sm sm:prose-base max-w-none
                prose-headings:text-white prose-p:text-white/90 prose-strong:text-white
                prose-code:text-blue-300 prose-code:bg-black/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs sm:prose-code:text-sm
                prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:text-sm
                prose-blockquote:border-l-blue-400 prose-blockquote:text-white/80
                prose-ul:text-white/90 prose-ol:text-white/90 prose-ul:pl-4 prose-ol:pl-4
                prose-li:text-white/90 prose-li:text-sm sm:prose-li:text-base prose-li:leading-relaxed
                prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                prose-table:text-white/90 prose-thead:text-white prose-tbody:text-white/80
                prose-th:border-white/20 prose-td:border-white/20 prose-th:text-sm prose-td:text-sm"
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
                          <div className="flex items-center justify-between bg-gray-900/90 backdrop-blur-sm border border-white/20 rounded-t-xl px-4 py-3">
                            <span className="text-xs text-white/70 font-semibold uppercase tracking-wider">{language}</span>
                            <button
                              onClick={() => onCopyToClipboard(codeString, codeId)}
                              className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105"
                            >
                              {copiedCode === codeId ? (
                                <>
                                  <Check className="w-3 h-3 text-green-400" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="bg-gray-950/80 backdrop-blur-sm border border-white/20 border-t-0 rounded-b-xl p-4 overflow-x-auto m-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      ) : (
                        <code
                          className="bg-white/10 px-2 py-1 rounded-lg text-blue-300 font-mono text-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    table: ({ children, ...props }) => (
                      <div className="overflow-x-auto my-4 rounded-xl border border-white/20">
                        <table className="min-w-full border-collapse bg-white/5 backdrop-blur-sm" {...props}>
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children, ...props }) => (
                      <th className="border border-white/20 bg-white/10 px-4 py-3 text-left font-semibold text-white/90" {...props}>
                        {children}
                      </th>
                    ),
                    td: ({ children, ...props }) => (
                      <td className="border border-white/20 px-4 py-3 text-white/80" {...props}>
                        {children}
                      </td>
                    ),
                    blockquote: ({ children, ...props }) => (
                      <blockquote className="border-l-4 border-blue-400 pl-4 my-4 italic text-white/80 bg-blue-500/10 py-3 rounded-r-lg backdrop-blur-sm" {...props}>
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {message.content}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                <span className="font-medium">{message.timestamp.toLocaleTimeString()}</span>
              </div>
              {message.model && (
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                  <span className="font-medium">{message.model}</span>
                </div>
              )}
            </div>
            
            {/* Regenerate button for last assistant message */}
            {message.role === "assistant" && isLastAssistantMessage && onRegenerateMessage && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onRegenerateMessage}
                  disabled={isLoading || isRegenerating}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
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
          <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl relative ring-2 ring-white/20">
            <User className="w-6 h-6 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white drop-shadow-lg" />
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-2xl opacity-30 blur-sm animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}