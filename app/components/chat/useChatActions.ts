import { useCallback } from "react";
import api from "~/lib/api";
import { useModels } from "~/hooks/useModels";
import type { Message, ChatSession } from "./types";

interface UseChatActionsProps {
  // State from useChatState
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setConnectionStatus: React.Dispatch<React.SetStateAction<any>>;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
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
  setShowModelSelector: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTools: React.Dispatch<React.SetStateAction<string | null>>;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // Helper functions
  addWelcomeMessage: () => void;
  loadChatHistory: (modelFilter?: string) => Promise<void>;
  updateChatSession: (updatedMessages: Message[]) => void;
}

export function useChatActions(props: UseChatActionsProps) {
  const { models } = useModels();
  const {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    setIsLoading,
    setError,
    setConnectionStatus,
    selectedModel,
    setSelectedModel,
    chatHistory,
    setChatHistory,
    currentChatId,
    setCurrentChatId,
    setCopiedCode,
    lastAssistantMessage,
    setIsRegenerating,
    setShowModelSelector,
    setShowTools,
    setSidebarOpen,
    addWelcomeMessage,
    loadChatHistory,
    updateChatSession,
  } = props;

  // Handle sending messages with proper context
  const handleSend = useCallback(async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    setConnectionStatus("connecting");

    try {
      // Get the full conversation context from backend + current messages
      // This ensures we have complete memory context
      const allHistory = await api.getChatHistory(100); // Get more history for context
      const allMessages = allHistory.messages || [];

      // Combine with current session messages for context
      const currentSessionMessages = messages.filter((m) => m.id !== "welcome");
      const contextMessages = [
        ...allMessages,
        ...currentSessionMessages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.getTime() / 1000,
          message_id: m.id,
          model_used: m.model,
        })),
      ];

      // Build context string for the API
      const contextString = contextMessages
        .slice(-20) // Use last 20 messages for context to avoid token limits
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      console.log(
        `Sending message with ${contextMessages.length} context messages`
      );

      const response = await api.sendChatMessage({
        content,
        model: selectedModel,
        context: contextString.length > 0 ? contextString : undefined,
      });

      setConnectionStatus("connected");

      const aiResponse: Message = {
        id: response.message_id,
        content: response.content,
        role: "assistant",
        timestamp: new Date(response.timestamp * 1000),
        model: response.model_used || selectedModel,
      };

      setMessages((prev) => [...prev, aiResponse]);

      // Update chat session in history
      updateChatSession([...messages, userMessage, aiResponse]);
    } catch (err) {
      console.error("Chat API error:", err);
      setConnectionStatus("error");

      let errorMessage = "Failed to send message";
      if (err instanceof Error) {
        if (err.message.includes("model")) {
          errorMessage =
            "Model configuration error. Trying with default model...";
          setTimeout(() => {
            setSelectedModel("deepseek-r1-0528");
            setError(null);
            setConnectionStatus("connected");
          }, 2000);
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);

      const errorResponseMessage: Message = {
        id: `error-${Date.now()}`,
        content:
          "I'm having trouble processing your request right now. This might be due to model configuration issues. Please try again in a moment, or try switching to a different AI model.",
        role: "assistant",
        timestamp: new Date(),
        model: selectedModel,
      };
      setMessages((prev) => [...prev, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, selectedModel, setMessages, setInput, setIsLoading, setError, setConnectionStatus, updateChatSession, setSelectedModel]);

  // Copy code to clipboard
  const copyToClipboard = useCallback(async (code: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [setCopiedCode]);

  // Regenerate last assistant message
  const regenerateLastMessage = useCallback(async () => {
    if (!lastAssistantMessage || isLoading) return;

    setIsRegenerating(true);
    
    try {
      // Find the user message that triggered the last assistant response
      const lastMessageIndex = messages.findIndex(m => m.id === lastAssistantMessage.id);
      const userMessage = lastMessageIndex > 0 ? messages[lastMessageIndex - 1] : null;
      
      if (!userMessage || userMessage.role !== 'user') {
        throw new Error('Could not find the original user message');
      }

      // Remove the last assistant message
      setMessages(prev => prev.filter(m => m.id !== lastAssistantMessage.id));
      
      // Regenerate response with the same user message
      await handleSend(userMessage.content);
      
    } catch (error) {
      console.error('Failed to regenerate message:', error);
      setError('Failed to regenerate message. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  }, [lastAssistantMessage, isLoading, messages, setIsRegenerating, setMessages, handleSend, setError]);

  // Handle model selection with history loading
  const selectModel = useCallback(async (modelId: string) => {
    const previousModel = selectedModel;
    setSelectedModel(modelId);
    setShowModelSelector(false);

    // Load history for the new model
    try {
      await loadChatHistory(modelId);
      console.log(`Switched to model ${modelId} and loaded its history`);
    } catch (error) {
      console.error(`Failed to load history for model ${modelId}:`, error);
    }

    // Add system message about model change if switching between different models
    const modelInfo = models.find((m) => m.id === modelId);
    if (modelInfo && previousModel !== modelId && messages.length > 0) {
      const modelChangeMessage: Message = {
        id: `model-change-${Date.now()}`,
        content: `🔄 Switched to **${modelInfo.name}** (${modelInfo.provider}). Your conversation history for this model has been loaded. How can I help you?`,
        role: "assistant",
        timestamp: new Date(),
        model: modelId,
      };

      // Add the message after a small delay to ensure history is loaded
      setTimeout(() => {
        setMessages((prev) => [...prev, modelChangeMessage]);
      }, 100);
    }
  }, [selectedModel, setSelectedModel, setShowModelSelector, loadChatHistory, messages, setMessages]);

  // Start new chat
  const startNewChat = useCallback(() => {
    if (messages.length > 0) {
      const currentChat: ChatSession = {
        id: currentChatId || `chat_${Date.now()}`,
        title: messages[0]?.content.slice(0, 50) + "..." || "New Chat",
        timestamp: new Date(),
        preview:
          messages[messages.length - 1]?.content.slice(0, 100) + "..." || "",
        model: selectedModel,
        messageCount: messages.length,
      };

      setChatHistory((prev) => [currentChat, ...prev.slice(0, 19)]);
    }

    setMessages([]);
    setCurrentChatId(`chat_${Date.now()}`);
    setError(null);
    setShowTools(null);
    setSidebarOpen(false);
  }, [messages, currentChatId, selectedModel, setChatHistory, setMessages, setCurrentChatId, setError, setShowTools, setSidebarOpen]);

  // Load chat from history
  const loadChatFromHistory = useCallback(async (chatSession: ChatSession) => {
    try {
      setCurrentChatId(chatSession.id);

      // Close sidebar on mobile
      setSidebarOpen(false);

      // Load the full history and filter for this model if needed
      const historyResponse = await api.getChatHistory(100, chatSession.model);

      if (historyResponse.messages && historyResponse.messages.length > 0) {
        const formattedMessages: Message[] = historyResponse.messages.map(
          (msg) => ({
            id: msg.message_id,
            content: msg.content,
            role: msg.role,
            timestamp: new Date(msg.timestamp * 1000),
            model: msg.model_used || chatSession.model,
          })
        );

        // For this simplified version, show the messages from this timeframe
        // You could implement more sophisticated session management here
        setMessages(formattedMessages.slice(-20)); // Show last 20 messages
      }
    } catch (error) {
      console.error("Failed to load chat from history:", error);
      // Fall back to starting a new chat
      startNewChat();
    }
  }, [setCurrentChatId, setSidebarOpen, setMessages, startNewChat]);

  // Delete chat from history
  const deleteChatFromHistory = useCallback((chatId: string) => {
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
  }, [setChatHistory]);

  // Handle Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return {
    handleSend,
    copyToClipboard,
    regenerateLastMessage,
    selectModel,
    startNewChat,
    loadChatFromHistory,
    deleteChatFromHistory,
    handleKeyDown,
  };
}