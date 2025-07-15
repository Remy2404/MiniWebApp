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
      } transition-all duration-500 ease-out bg-gray-950/50 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden fixed md:relative z-30 h-full top-0 ${
        sidebarOpen ? "left-0 shadow-2xl" : "-left-80"
      } md:left-0`}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <div className="relative z-30 h-full flex flex-col bg-gradient-to-b from-gray-950/30 via-gray-900/30 to-gray-950/50 backdrop-blur-xl">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10 flex-shrink-0 bg-gradient-to-r from-white/5 to-transparent">
          <div className="flex items-center justify-between">
            <h2
              className={`text-lg font-semibold flex items-center gap-2 transition-all duration-500 ${
                sidebarOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 md:opacity-0"
              }`}
            >
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <History className="w-4 h-4 text-white" />
              </div>
              <span className={sidebarOpen ? "block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" : "hidden md:hidden"}>
                Chat History
              </span>
            </h2>
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-105 active:scale-95"
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
            className={`w-full mt-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 rounded-xl px-4 py-3 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${
              sidebarOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 md:opacity-0"
            }`}
            title="Start new chat"
          >
            <div className="p-1 bg-white/20 rounded-lg">
              <Plus className="w-4 h-4" />
            </div>
            <span
              className={`transition-all duration-300 font-medium ${
                sidebarOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              New Chat
            </span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {chatHistory.length === 0 ? (
            <div
              className={`text-center text-white/50 py-12 transition-all duration-500 ${
                sidebarOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <div className="relative mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 opacity-60" />
                </div>
                <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl animate-pulse" />
              </div>
              <p
                className={`transition-all duration-500 text-sm font-medium ${
                  sidebarOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                No conversations yet
              </p>
              <p
                className={`transition-all duration-500 text-xs text-white/30 mt-1 ${
                  sidebarOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                Start a new chat to begin
              </p>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div
                key={chat.id}
                className={`group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 cursor-pointer transition-all duration-300 backdrop-blur-sm hover:scale-105 hover:shadow-lg ${
                  currentChatId === chat.id
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50 shadow-lg"
                    : ""
                } ${
                  sidebarOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
                style={{ transitionDelay: `${index * 75}ms` }}
                onClick={() => onLoadChatFromHistory(chat)}
                title={chat.title}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
                      <h3
                        className={`font-semibold text-sm truncate transition-all duration-300 text-white/90 ${
                          sidebarOpen ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {chat.title}
                      </h3>
                    </div>
                    <p
                      className={`text-xs text-white/60 mt-1 line-clamp-2 transition-all duration-300 leading-relaxed ${
                        sidebarOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {chat.preview}
                    </p>
                    <div
                      className={`flex items-center gap-2 mt-3 transition-all duration-300 ${
                        sidebarOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3 text-white/40" />
                        <span className="text-xs text-white/60 font-medium">
                          {chat.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                        <MessageSquare className="w-3 h-3 text-white/40" />
                        <span className="text-xs text-white/60 font-medium">
                          {chat.messageCount}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChatFromHistory(chat.id);
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 hover:scale-110 ${
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