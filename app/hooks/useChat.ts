// Custom hook for chat functionality
import { useState, useRef, useEffect, useCallback } from "react";
import api from "~/lib/api";
import type { 
  Message, 
  UserData, 
  ChatSession, 
  ConnectionStatus
} from "../components/chat/types";

export function useChat() {
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedModel, setSelectedModel] = useState("gemini");
  
  // UI state
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Chat history and sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize authentication and load chat history
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const authResult = await api.validateAuth();
        if (authResult.valid && authResult.user) {
          setUserData(authResult.user);
          
          // Check localStorage first, then user preferences, then default
          let preferredModel = 'gemini'; // default
          try {
            const storedModel = localStorage.getItem('selectedModel');
            if (storedModel) {
              preferredModel = storedModel;
            } else if (authResult.preferences?.selected_model) {
              preferredModel = authResult.preferences.selected_model;
            }
          } catch (error) {
            console.error('Failed to load model preference:', error);
          }
          
          setSelectedModel(preferredModel);
          
          // Load existing chat history for the preferred model
          try {
            const historyResponse = await api.getChatHistory(50, preferredModel);
            if (historyResponse.messages && historyResponse.messages.length > 0) {
              // Convert backend messages to frontend format
              const formattedMessages: Message[] = historyResponse.messages.map((msg: any) => ({
                id: msg.message_id || `msg_${Date.now()}_${Math.random()}`,
                content: msg.content || '',
                role: msg.role as "user" | "assistant",
                timestamp: new Date(msg.timestamp || Date.now()),
                model: msg.model_used || preferredModel
              }));
              
              setMessages(formattedMessages);
            } else {
              // Add welcome message only if no history exists
              const welcomeMessage: Message = {
                id: "welcome",
                content: `👋 Hello ${authResult.user.first_name}! I'm Ploymind AI, your intelligent assistant. How can I help you today?`,
                role: "assistant",
                timestamp: new Date(),
                model: preferredModel
              };
              setMessages([welcomeMessage]);
            }
          } catch (historyError) {
            console.error('Failed to load chat history:', historyError);
            // Add welcome message as fallback
            const welcomeMessage: Message = {
              id: "welcome",
              content: `👋 Hello ${authResult.user.first_name}! I'm Ploymind AI, your intelligent assistant. How can I help you today?`,
              role: "assistant",
              timestamp: new Date(),
              model: preferredModel
            };
            setMessages([welcomeMessage]);
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setError('Failed to initialize chat. Please refresh the page.');
        setIsInitialized(true);
      }
    };

    initializeChat();
  }, []); // Remove selectedModel dependency to prevent re-initialization

  // Handle sending messages
  const handleSend = useCallback(async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    setConnectionStatus('connecting');

    try {
      const response = await api.sendChatMessage({
        content,
        model: selectedModel,
        context: messages.length > 0 ? `Previous conversation with ${messages.length} messages` : undefined
      });

      setConnectionStatus('connected');

      const aiResponse: Message = {
        id: response.message_id,
        content: response.content,
        role: "assistant",
        timestamp: new Date(response.timestamp * 1000),
        model: response.model_used || selectedModel
      };

      setMessages(prev => [...prev, aiResponse]);
      
    } catch (err) {
      console.error('Chat API error:', err);
      setConnectionStatus('error');
      
      let errorMessage = 'Failed to send message';
      if (err instanceof Error) {
        if (err.message.includes('model')) {
          errorMessage = 'Model configuration error. Trying with default model...';
          setTimeout(() => {
            setSelectedModel("deepseek");
            setError(null);
            setConnectionStatus('connected');
          }, 2000);
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      
      const errorResponseMessage: Message = {
        id: `error-${Date.now()}`,
        content: "I'm having trouble processing your request right now. This might be due to model configuration issues. Please try again in a moment, or try switching to a different AI model.",
        role: "assistant",
        timestamp: new Date(),
        model: selectedModel
      };
      setMessages(prev => [...prev, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, selectedModel, messages.length]);

  // Start new chat
  const startNewChat = useCallback(() => {
    if (messages.length > 0) {
      const currentChat: ChatSession = {
        id: currentChatId || `chat_${Date.now()}`,
        title: messages[0]?.content.slice(0, 50) + "..." || "New Chat",
        timestamp: new Date(),
        preview: messages[messages.length - 1]?.content.slice(0, 100) + "..." || "",
        model: selectedModel,
        messageCount: messages.length
      };
      
      setChatHistory(prev => [currentChat, ...prev.slice(0, 19)]);
    }
    
    setMessages([]);
    setCurrentChatId(`chat_${Date.now()}`);
    setError(null);
    setSidebarOpen(false);
  }, [messages, currentChatId, selectedModel]);

  // Load chat from history
  const loadChatFromHistory = useCallback((chatSession: ChatSession) => {
    startNewChat();
    setSidebarOpen(false);
  }, [startNewChat]);

  // Delete chat from history
  const deleteChatFromHistory = useCallback((chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Model selection with local storage persistence
  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    setShowModelSelector(false);
    
    // Persist model selection in localStorage
    try {
      localStorage.setItem('selectedModel', modelId);
    } catch (error) {
      console.error('Failed to save model to localStorage:', error);
    }
  }, []);

  // Toggle model selector
  const toggleModelSelector = useCallback(() => {
    setShowModelSelector(prev => !prev);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle model changes - load history for the new model
  useEffect(() => {
    const loadModelHistory = async () => {
      if (!isInitialized || !userData) return;
      
      try {
        const historyResponse = await api.getChatHistory(50, selectedModel);
        if (historyResponse.messages && historyResponse.messages.length > 0) {
          // Convert backend messages to frontend format
          const formattedMessages: Message[] = historyResponse.messages.map((msg: any) => ({
            id: msg.message_id || `msg_${Date.now()}_${Math.random()}`,
            content: msg.content || '',
            role: msg.role as "user" | "assistant",
            timestamp: new Date(msg.timestamp || Date.now()),
            model: msg.model_used || selectedModel
          }));
          
          setMessages(formattedMessages);
        } else {
          // Show welcome message for models with no history
          const welcomeMessage: Message = {
            id: `welcome_${selectedModel}`,
            content: `🔄 Switched to ${selectedModel}. How can I help you with this model?`,
            role: "assistant",
            timestamp: new Date(),
            model: selectedModel
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Failed to load history for model:', selectedModel, error);
        // Keep existing messages but update model reference
        setMessages(prev => prev.map(msg => ({ ...msg, model: selectedModel })));
      }
    };

    // Only run this when model changes, not on initial load
    if (isInitialized) {
      loadModelHistory();
    }
  }, [selectedModel, isInitialized, userData]);

  // Prop collections for components
  const sidebarProps = {
    isOpen: sidebarOpen,
    onToggle: toggleSidebar,
    chatHistory,
    onNewChat: startNewChat,
    onLoadChat: loadChatFromHistory,
    onDeleteChat: deleteChatFromHistory
  };

  const headerProps = {
    userData,
    selectedModel,
    showModelSelector,
    connectionStatus,
    onToggleSidebar: toggleSidebar,
    onToggleModelSelector: toggleModelSelector,
    onSelectModel: handleModelSelect
  };

  const messageProps = {
    messages,
    isLoading,
    ref: messagesEndRef
  };

  const inputProps = {
    value: input,
    onChange: setInput,
    onSend: handleSend,
    isLoading,
    error,
    onClearError: clearError
  };

  return {
    // Raw state (for custom implementations)
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
    
    // Individual actions (for custom implementations)
    setInput,
    handleSend,
    startNewChat,
    loadChatFromHistory,
    deleteChatFromHistory,
    toggleSidebar,
    handleModelSelect,
    toggleModelSelector,
    clearError,
    
    // Prop collections (for easier component integration)
    sidebarProps,
    headerProps,
    messageProps,
    inputProps
  };
}
