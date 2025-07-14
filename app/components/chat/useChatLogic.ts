import { useEffect, useCallback } from "react";
import api from "~/lib/api";
import type { Message, ChatSession, UserData } from "./types";

interface UseChatLogicProps {
  // State from useChatState
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  connectionStatus: string;
  setConnectionStatus: React.Dispatch<React.SetStateAction<any>>;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  isInitialized: boolean;
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  chatHistory: ChatSession[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  currentChatId: string | null;
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
  copiedCode: string | null;
  setCopiedCode: React.Dispatch<React.SetStateAction<string | null>>;
  lastAssistantMessage: Message | null;
  setLastAssistantMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  isRegenerating: boolean;
  setIsRegenerating: React.Dispatch<React.SetStateAction<boolean>>;
  showModelSelector: boolean;
  setShowModelSelector: React.Dispatch<React.SetStateAction<boolean>>;
  showTools: string | null;
  setShowTools: React.Dispatch<React.SetStateAction<string | null>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useChatLogic(props: UseChatLogicProps) {
  const {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    setIsLoading,
    error,
    setError,
    connectionStatus,
    setConnectionStatus,
    userData,
    setUserData,
    selectedModel,
    setSelectedModel,
    isInitialized,
    setIsInitialized,
    chatHistory,
    setChatHistory,
    currentChatId,
    setCurrentChatId,
    copiedCode,
    setCopiedCode,
    lastAssistantMessage,
    setLastAssistantMessage,
    isRegenerating,
    setIsRegenerating,
    showModelSelector,
    setShowModelSelector,
    showTools,
    setShowTools,
    sidebarOpen,
    setSidebarOpen,
  } = props;

  // Initialize authentication and load chat history
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setConnectionStatus("connecting");
        const authResult = await api.validateAuth();

        if (authResult.valid && authResult.user) {
          setUserData(authResult.user);

          if (authResult.preferences?.selected_model) {
            setSelectedModel(authResult.preferences.selected_model);
          }

          setConnectionStatus("connected");
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setError("Failed to initialize chat. Please refresh the page.");
        setConnectionStatus("error");
        setIsInitialized(true);
      }
    };

    initializeChat();
  }, []);

  // Helper function to add welcome message
  const addWelcomeMessage = useCallback(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      content: `👋 Hello ${
        userData?.first_name || "there"
      }! I'm Ploymind AI, your intelligent assistant. How can I help you today?`,
      role: "assistant",
      timestamp: new Date(),
      model: selectedModel,
    };
    setMessages([welcomeMessage]);
  }, [userData, selectedModel, setMessages]);

  // Create chat sessions from conversation history
  const createChatSessionsFromHistory = useCallback((
    allMessages: Message[]
  ): ChatSession[] => {
    const sessions: ChatSession[] = [];
    const sessionMap = new Map<string, Message[]>();

    // Group messages by conversation (every user message starts a new conversation until next user message)
    let currentSessionId = "";
    let currentSessionMessages: Message[] = [];

    for (const message of allMessages) {
      if (message.role === "user") {
        // Save previous session if exists
        if (currentSessionId && currentSessionMessages.length > 0) {
          sessionMap.set(currentSessionId, [...currentSessionMessages]);
        }
        // Start new session
        currentSessionId = `session_${message.timestamp.getTime()}`;
        currentSessionMessages = [message];
      } else if (currentSessionId) {
        currentSessionMessages.push(message);
      }
    }

    // Don't forget the last session
    if (currentSessionId && currentSessionMessages.length > 0) {
      sessionMap.set(currentSessionId, currentSessionMessages);
    }

    // Convert to chat sessions
    sessionMap.forEach((messages, sessionId) => {
      const firstUserMessage = messages.find((m) => m.role === "user");
      const lastMessage = messages[messages.length - 1];

      if (firstUserMessage) {
        sessions.push({
          id: sessionId,
          title:
            firstUserMessage.content.substring(0, 40) +
            (firstUserMessage.content.length > 40 ? "..." : ""),
          timestamp: firstUserMessage.timestamp,
          preview:
            lastMessage.content.substring(0, 80) +
            (lastMessage.content.length > 80 ? "..." : ""),
          model: firstUserMessage.model || selectedModel,
          messageCount: messages.length,
        });
      }
    });

    // Sort by timestamp (newest first)
    return sessions.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [selectedModel]);

  return {
    addWelcomeMessage,
    createChatSessionsFromHistory,
  };
}