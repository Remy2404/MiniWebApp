import { 
  History, 
  X, 
  ChevronRight, 
  Plus, 
  MessageSquare, 
  Clock, 
  Trash2 
} from "lucide-react";
import type { ChatSession } from "./types";

interface ChatSidebarProps {
  sidebarOpen: boolean;
  chatHistory: ChatSession[];
  currentChatId: string | null;
  onToggleSidebar: () => void;
  onStartNewChat: () => void;
  onLoadChatFromHistory: (chat: ChatSession) => void;
  onDeleteChatFromHistory: (chatId: string) => void;
}

export function ChatSidebar({
  sidebarOpen,
  chatHistory,
  currentChatId,
  onToggleSidebar,
  onStartNewChat,
  onLoadChatFromHistory,
  onDeleteChatFromHistory,
}: ChatSidebarProps) {
  return (
    <div
      id="chat-sidebar"
      className={`${
        sidebarOpen ? "w-80 md:w-80" : "w-0 md:w-16"
      } transition-all duration-300 ease-in-out bg-black/30 backdrop-blur-lg border-r border-white/10 flex flex-col overflow-hidden fixed md:relative z-30 h-full top-0 ${
        sidebarOpen ? "left-0" : "-left-80"
      } md:left-0`}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <div className="relative z-30 h-full flex flex-col bg-black/30 backdrop-blur-lg">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2
              className={`text-lg font-semibold flex items-center gap-2 transition-all duration-300 ${
                sidebarOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 md:opacity-0"
              }`}
            >
              <History className="w-5 h-5" />
              <span className={sidebarOpen ? "block" : "hidden md:hidden"}>
                Chat History
              </span>
            </h2>
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onStartNewChat}
            className={`w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300 ${
              sidebarOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 md:opacity-0"
            }`}
            title="Start new chat"
          >
            <Plus className="w-4 h-4" />
            <span
              className={`transition-all duration-300 ${
                sidebarOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              New Chat
            </span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {chatHistory.length === 0 ? (
            <div
              className={`text-center text-white/50 py-8 transition-all duration-300 ${
                sidebarOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p
                className={`transition-all duration-300 ${
                  sidebarOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                No chat history yet
              </p>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div
                key={chat.id}
                className={`group bg-white/5 hover:bg-white/10 rounded-lg p-3 cursor-pointer transition-all duration-300 ${
                  currentChatId === chat.id
                    ? "bg-blue-500/20 border-l-2 border-blue-400"
                    : ""
                } ${
                  sidebarOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
                onClick={() => onLoadChatFromHistory(chat)}
                title={chat.title}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-sm truncate transition-all duration-300 ${
                        sidebarOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {chat.title}
                    </h3>
                    <p
                      className={`text-xs text-white/60 mt-1 line-clamp-2 transition-all duration-300 ${
                        sidebarOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {chat.preview}
                    </p>
                    <div
                      className={`flex items-center gap-2 mt-2 transition-all duration-300 ${
                        sidebarOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <Clock className="w-3 h-3 text-white/40" />
                      <span className="text-xs text-white/40">
                        {chat.timestamp.toLocaleDateString()}
                      </span>
                      <span className="text-xs text-white/40">•</span>
                      <span className="text-xs text-white/40">
                        {chat.messageCount} messages
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChatFromHistory(chat.id);
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all ${
                      sidebarOpen ? "group-hover:opacity-100" : "opacity-0"
                    }`}
                    title="Delete chat"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}