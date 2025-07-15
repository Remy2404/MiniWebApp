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
  } = chatActions;

  // Initialize chat state and load data when component mounts
  useEffect(() => {
    // Reinitialize authentication when component mounts on client side
    if (typeof window !== 'undefined') {
      console.log('🔄 Chat component mounted, reinitializing auth...');
      
      // Wait for Telegram WebApp to be fully loaded
      const initializeTelegramAuth = () => {
        if (window.Telegram?.WebApp) {
          // Tell Telegram the Mini App is ready
          if (typeof window.Telegram.WebApp.ready === "function") {
            window.Telegram.WebApp.ready();
          }
          
          // Reinitialize authentication with fresh data
          api.reinitializeAuth();
          
          console.log('✅ Telegram WebApp ready state set and auth reinitialized');
        } else {
          console.warn('⚠️ Telegram WebApp not available, retrying in 500ms...');
          // Retry after a short delay if Telegram WebApp is not yet available
          setTimeout(initializeTelegramAuth, 500);
        }
      };
      
      // Start initialization
      initializeTelegramAuth();
    }
  }, []);

  // Load chat history when component is initialized and model is selected
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
      <div className="h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 flex items-center justify-center relative overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto animate-pulse flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mx-auto animate-ping opacity-30" />
          </div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Ploymind AI
          </h1>
          <p className="text-white/60 text-base">
            Initializing your intelligent assistant...
          </p>
          <div className="flex items-center justify-center gap-1 mt-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 flex text-white overflow-hidden relative safe-area-inset"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Enhanced Background with mobile optimization */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-900/10 to-transparent" />
      
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
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out relative z-10 ${
          sidebarOpen ? "md:ml-0" : "ml-0"
        } min-w-0 h-full`}
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