// Enhanced Modular Chat Interface - Full-featured ChatGPT-like UI
import { useChat } from "~/hooks/useChat";
import { ChatSidebar } from "~/components/chat/ChatSidebar";
import { ChatHeader } from "~/components/chat/ChatHeader";
import EnhancedMessageList from "~/components/chat/EnhancedMessageList";
import EnhancedChatInput from "~/components/chat/EnhancedChatInput";
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

export default function EnhancedChat() {
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

  // Message action handlers
  const handleMessageCopy = (content: string) => {
    console.log('Message copied:', content);
  };

  const handleMessageEdit = (messageId: string) => {
    console.log('Edit message:', messageId);
    // TODO: Implement message editing
  };

  const handleMessageRegenerate = (messageId: string) => {
    console.log('Regenerate message:', messageId);
    // TODO: Implement message regeneration
  };

  const handleMessageSpeak = (content: string) => {
    console.log('Speak message:', content);
    // TODO: Implement text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      speechSynthesis.speak(utterance);
    }
  };

  const handleMessageLike = (messageId: string) => {
    console.log('Like message:', messageId);
    // TODO: Implement message rating
  };

  const handleMessageSave = (messageId: string) => {
    console.log('Save message:', messageId);
    // TODO: Implement message bookmarking
  };

  const handleMessageDelete = (messageId: string) => {
    console.log('Delete message:', messageId);
    // TODO: Implement message deletion
  };

  const handleVoiceRecord = () => {
    console.log('Start voice recording');
    // TODO: Implement voice recording
  };

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
    // TODO: Implement file upload processing
  };

  // Show loading screen during initialization
  if (!isInitialized) {
    return <LoadingScreen message="Loading Ploymind AI..." />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex text-white overflow-hidden">
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
      <div className="flex-1 flex flex-col min-w-0">
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

        {/* Enhanced Messages Area */}
        <EnhancedMessageList
          messages={messages}
          isLoading={isLoading}
          ref={messagesEndRef}
          onMessageCopy={handleMessageCopy}
          onMessageEdit={handleMessageEdit}
          onMessageRegenerate={handleMessageRegenerate}
          onMessageSpeak={handleMessageSpeak}
          onMessageLike={handleMessageLike}
          onMessageSave={handleMessageSave}
          onMessageDelete={handleMessageDelete}
        />

        {/* Enhanced Sticky Input Area */}
        <EnhancedChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          error={error}
          onClearError={clearError}
          placeholder="Message Ploymind AI..."
          enableVoice={true}
          enableFileUpload={true}
          onVoiceRecord={handleVoiceRecord}
          onFileUpload={handleFileUpload}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        />
      )}
    </div>
  );
}
