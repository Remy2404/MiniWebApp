import { useState, useEffect } from "react";
import api from "~/lib/api";
import type { UserData, Message, ChatSession, ConnectionStatus } from "./types";

export function useChatState() {
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connected");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedModel, setSelectedModel] = useState("gemini");

  // UI state
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showTools, setShowTools] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Chat history and sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // UI enhancement states
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<Message | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Touch gesture support for sidebar
  const [touchStart, setTouchStart] = useState<number | null>(null);

  return {
    // Core state
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

    // UI state
    showModelSelector,
    setShowModelSelector,
    showTools,
    setShowTools,
    isInitialized,
    setIsInitialized,

    // Chat history and sidebar state
    sidebarOpen,
    setSidebarOpen,
    chatHistory,
    setChatHistory,
    currentChatId,
    setCurrentChatId,

    // UI enhancement states
    copiedCode,
    setCopiedCode,
    lastAssistantMessage,
    setLastAssistantMessage,
    isRegenerating,
    setIsRegenerating,

    // Touch gesture support
    touchStart,
    setTouchStart,
  };
}