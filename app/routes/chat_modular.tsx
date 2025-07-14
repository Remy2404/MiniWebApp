// Modular Chat Interface - ChatGPT-like UI with responsive design
import { useChat } from "~/hooks/useChat";
import { ChatSidebar } from "~/components/chat/ChatSidebar";
import { ChatHeader } from "~/components/chat/ChatHeader";
import { MessagesList as MessageList } from "~/components/chat/MessagesList";
import { ChatInput } from "~/components/chat/ChatInput";
import LoadingScreen from "~/components/chat/LoadingScreen";


import type { Route } from "./+types/chat";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ploymind AI - Intelligent Assistant" },
    { name: "description", content: "Experience the future of AI conversation with Ploymind - your comprehensive AI companion" },
    { name: "viewport", content: "width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover" },
    { name: "theme-color", content: "#667eea" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    { name: "format-detection", content: "telephone=no" },
  ];
}

export default function Chat() {
  const {
    // State
    messages,
    input,
    isLoading,
    error,
    connectionStatus,
    userData,
    selectedModel,
    showModelSelector,
    isInitialized,
    sidebarOpen,
    chatHistory,
    
    // Refs
    messagesEndRef,
    
    // Actions
    setInput,
    handleSend,
    startNewChat,
    loadChatFromHistory,
    deleteChatFromHistory,
    toggleSidebar,
    handleModelSelect,
    toggleModelSelector,
    clearError,
  } = useChat();

  // Show loading screen during initialization
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex text-white">
      {/* Responsive Sidebar */}
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        chatHistory={chatHistory}
        currentChatId={null}
        onToggleSidebar={toggleSidebar}
        onStartNewChat={startNewChat}
        onLoadChatFromHistory={loadChatFromHistory}
        onDeleteChatFromHistory={deleteChatFromHistory}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Model Selector */}
        <ChatHeader
          selectedModel={selectedModel}
          connectionStatus={connectionStatus}
          showModelSelector={showModelSelector}
          onToggleSidebar={toggleSidebar}
          onToggleModelSelector={toggleModelSelector}
          onSelectModel={handleModelSelect}
          onStartNewChat={startNewChat}
        />

        {/* Messages Area */}
        <MessageList
          messages={messages}
          isLoading={isLoading}
          copiedCode={null}
          lastAssistantMessage={null}
          isRegenerating={false}
          onCopyToClipboard={() => {}}
          onRegenerateMessage={() => {}}
        />

        {/* Sticky Input Area */}
        <ChatInput
          input={input}
          isLoading={isLoading}
          error={error}
          onInputChange={setInput}
          onSend={handleSend}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
      </div>

      {/* Click overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
