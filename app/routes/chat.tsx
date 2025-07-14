import { useState, useEffect, useCallback } from "react";
import api from "~/lib/api";
import type { Route } from "./+types/chat";
import {
  ChatSidebar,
  ChatHeader,
  MessagesList,
  ChatInput,
  useChatState,
  useChatLogic,
  useChatActions,
  type Message,
  type ChatSession,
} from "~/components/chat";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ploymind AI - Intelligent Assistant" },
    {
      name: "description",
      content:
        "Experience the future of AI conversation with Ploymind - your comprehensive AI companion",
    },
  ];
}

export default function Chat() {
  // Use the separated state management hook
  const chatState = useChatState();

  // Extract state for easier access
  const {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    error,
    setError,
    connectionStatus,
    setConnectionStatus,
    userData,
    setUserData,
    selectedModel,
    setSelectedModel,
    showModelSelector,
    setShowModelSelector,
    isInitialized,
    setIsInitialized,
    sidebarOpen,
    setSidebarOpen,
    chatHistory,
    setChatHistory,
    currentChatId,
    setCurrentChatId,
    copiedCode,
    lastAssistantMessage,
    setLastAssistantMessage,
    isRegenerating,
    touchStart,
    setTouchStart,
  } = chatState;  // Load conversation history for memory context with model-specific support
  const loadChatHistory = useCallback(async (modelFilter?: string) => {
    try {
      // Load conversation history for the specific model or current selected model
      const targetModel = modelFilter || selectedModel;
      console.log(`Loading chat history for model: ${targetModel}`);

      // First try to get model-specific history
      let historyResponse = await api.getChatHistory(50, targetModel);

      // If no model-specific history found, load general history
      if (!historyResponse.messages || historyResponse.messages.length === 0) {
        historyResponse = await api.getChatHistory(50); // Get all history
      }

      if (historyResponse.messages && historyResponse.messages.length > 0) {
        // Convert API messages to UI format
        const formattedMessages: Message[] = historyResponse.messages.map(
          (msg) => ({
            id: msg.message_id,
            content: msg.content,
            role: msg.role,
            timestamp: new Date(msg.timestamp * 1000),
            model: msg.model_used || targetModel,
          })
        );

        // Filter messages for the current model if we have model-specific data
        const modelSpecificMessages = formattedMessages.filter(
          (msg) => !modelFilter || !msg.model || msg.model === targetModel
        );

        // Only show recent messages in UI (last 10), but keep full history for context
        const recentMessages = modelSpecificMessages.slice(-10);
        setMessages(recentMessages);

        // Create chat sessions from conversation groups
        const sessions = createChatSessionsFromHistory(formattedMessages);
        setChatHistory(sessions);

        if (!currentChatId && sessions.length > 0) {
          setCurrentChatId(sessions[0].id);
        }

        console.log(
          `Loaded ${formattedMessages.length} total messages, ${modelSpecificMessages.length} for model ${targetModel}, showing ${recentMessages.length} recent messages`
        );
      } else {
        // Add welcome message only if no history exists
        addWelcomeMessage();
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      // Add welcome message on error
      addWelcomeMessage();
    }
  }, [selectedModel, setMessages, setChatHistory, currentChatId, setCurrentChatId]);

  // Update chat session in history
  const updateChatSession = useCallback((updatedMessages: Message[]) => {
    if (updatedMessages.length === 0) return;

    const lastMessage = updatedMessages[updatedMessages.length - 1];
    const firstUserMessage = updatedMessages.find((m) => m.role === "user");

    const chatSession: ChatSession = {
      id: currentChatId || `chat_${Date.now()}`,
      title: firstUserMessage
        ? firstUserMessage.content.substring(0, 30) +
          (firstUserMessage.content.length > 30 ? "..." : "")
        : "Conversation",
      timestamp: lastMessage.timestamp,
      preview:
        lastMessage.content.substring(0, 50) +
        (lastMessage.content.length > 50 ? "..." : ""),
      model: selectedModel,
      messageCount: updatedMessages.filter((m) => m.id !== "welcome").length,
    };

    setChatHistory((prev) => {
      const existing = prev.find((session) => session.id === chatSession.id);
      if (existing) {
        return prev.map((session) =>
          session.id === chatSession.id ? chatSession : session
        );
      }
      return [chatSession, ...prev];
    });

    if (!currentChatId) {
      setCurrentChatId(chatSession.id);
    }
  }, [currentChatId, selectedModel, setChatHistory, setCurrentChatId]);

  // Use the chat logic hook
  const { addWelcomeMessage, createChatSessionsFromHistory } = useChatLogic({
    ...chatState,
  });

  // Use the chat actions hook
  const chatActions = useChatActions({
    ...chatState,
    addWelcomeMessage,
    loadChatHistory,
    updateChatSession,
  });

  const {
    handleSend,
    copyToClipboard,
    regenerateLastMessage,
    selectModel,
    startNewChat,
    loadChatFromHistory,
    deleteChatFromHistory,
    handleKeyDown,
  } = chatActions;  // Load chat history when component is initialized and model is selected
  useEffect(() => {
    if (isInitialized && selectedModel && userData) {
      console.log(`Loading chat history for initialized component with model: ${selectedModel}`);
      loadChatHistory(selectedModel).catch(error => {
        console.error('Failed to load initial chat history:', error);
      });
    }
  }, [isInitialized, selectedModel, userData, loadChatHistory]);

  // Track last assistant message for regenerate functionality
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id !== 'welcome') {
      setLastAssistantMessage(lastMessage);
    }
  }, [messages, setLastAssistantMessage]);

  // Toggle sidebar with responsive behavior
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, [setSidebarOpen]);

  // Auto-close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      // Auto-close sidebar on mobile when rotating or resizing
      if (
        typeof window !== "undefined" &&
        window.innerWidth < 768 &&
        sidebarOpen
      ) {
        setSidebarOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      // Close sidebar when clicking outside on mobile
      if (
        typeof window !== "undefined" &&
        window.innerWidth < 768 &&
        sidebarOpen
      ) {
        const sidebar = document.getElementById("chat-sidebar");
        const target = event.target as Node;
        if (sidebar && !sidebar.contains(target)) {
          setSidebarOpen(false);
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        window.removeEventListener("resize", handleResize);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [sidebarOpen, setSidebarOpen]);

  // Touch gesture support for sidebar
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || typeof window === "undefined") return;

    const touchEnd = e.changedTouches[0].clientX;
    const swipeDistance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    // Only handle swipes on mobile
    if (window.innerWidth < 768) {
      if (swipeDistance > minSwipeDistance && sidebarOpen) {
        // Swipe left to close sidebar
        setSidebarOpen(false);
      } else if (
        swipeDistance < -minSwipeDistance &&
        !sidebarOpen &&
        touchStart < 50
      ) {
        // Swipe right from left edge to open sidebar
        setSidebarOpen(true);
      }
    }

    setTouchStart(null);
  };  // Loading screen
  if (!isInitialized) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto animate-pulse" />
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mx-auto animate-ping opacity-75" />
          </div>
          <p className="text-white/80 mt-4 text-lg">
            Initializing Ploymind AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex text-white overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sidebar */}
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onToggleSidebar={toggleSidebar}
        onStartNewChat={startNewChat}
        onLoadChatFromHistory={loadChatFromHistory}
        onDeleteChatFromHistory={deleteChatFromHistory}
      />

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "md:ml-0" : "ml-0"
        }`}
      >
        {/* Header */}
        <ChatHeader
          selectedModel={selectedModel}
          connectionStatus={connectionStatus}
          showModelSelector={showModelSelector}
          onToggleSidebar={toggleSidebar}
          onToggleModelSelector={() => setShowModelSelector(!showModelSelector)}
          onSelectModel={selectModel}
          onStartNewChat={startNewChat}
        />

        {/* Messages Area */}
        <MessagesList
          messages={messages}
          isLoading={isLoading}
          copiedCode={copiedCode}
          lastAssistantMessage={lastAssistantMessage}
          isRegenerating={isRegenerating}
          onCopyToClipboard={copyToClipboard}
          onRegenerateMessage={regenerateLastMessage}
        />

        {/* Input Area */}
        <ChatInput
          input={input}
          isLoading={isLoading}
          error={error}
          onInputChange={setInput}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}