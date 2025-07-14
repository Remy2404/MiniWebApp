import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  Settings,
  RefreshCw,
  Edit3,
  Code,
  FileText,
  Volume2,
  ChevronDown,
  Menu,
  X,
  Zap,
  Brain,
  Search,
  Copy,
  Check,
  MoreHorizontal,
  MessageSquare,
  Wand2,
  Upload,
  Camera,
  FileAudio,
  Square,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Languages,
  Maximize2,
  Minimize2,
  Star,
  Heart,
  Bookmark,
  Plus,
  ChevronLeft,
  ChevronRight,
  History,
  Clock,
  Trash2
} from "lucide-react";
import api from "~/lib/api";

import type { Route } from "./+types/chat";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ploymind AI - Intelligent Assistant" },
    { name: "description", content: "Experience the future of AI conversation with Ploymind - your comprehensive AI companion" },
  ];
}

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  model: string;
  messageCount: number;
}

interface VoiceResponse {
  text: string;
  confidence?: number;
  language?: string;
  timestamp: number;
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  model?: string;
}

// Available AI models with their configurations
const AVAILABLE_MODELS = [
  { id: "gemini", name: "Gemini 2.0 Flash", emoji: "✨", provider: "Google", description: "Multimodal powerhouse", capabilities: ["text", "vision", "code"] },
  { id: "deepseek", name: "DeepSeek R1", emoji: "🧠", provider: "DeepSeek", description: "Advanced reasoning", capabilities: ["text", "code", "reasoning"] },
  { id: "cypher-alpha", name: "Cypher Alpha", emoji: "🔐", provider: "OpenRouter", description: "Security-focused", capabilities: ["text", "security"] },
];

export default function Chat() {
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connected');
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
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
          
          if (authResult.preferences?.selected_model) {
            setSelectedModel(authResult.preferences.selected_model);
          }
          
          // Add welcome message
          const welcomeMessage: Message = {
            id: "welcome",
            content: `👋 Hello ${authResult.user.first_name}! I'm Ploymind AI, your intelligent assistant. How can I help you today?`,
            role: "assistant",
            timestamp: new Date(),
            model: selectedModel
          };
          setMessages([welcomeMessage]);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setError('Failed to initialize chat. Please refresh the page.');
        setIsInitialized(true);
      }
    };

    initializeChat();
  }, [selectedModel]);

  // Handle sending messages
  const handleSend = async (messageContent?: string) => {
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
  };

  // Start new chat
  const startNewChat = () => {
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
    setShowTools(null);
    setSidebarOpen(false);
  };

  // Load chat from history
  const loadChatFromHistory = (chatSession: ChatSession) => {
    startNewChat();
    setSidebarOpen(false);
  };

  // Delete chat from history
  const deleteChatFromHistory = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isInitialized) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto animate-pulse" />
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mx-auto animate-ping opacity-75" />
          </div>
          <p className="text-white/80 mt-4 text-lg">Initializing Ploymind AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} md:${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-black/30 backdrop-blur-lg border-r border-white/10 flex flex-col overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <History className="w-5 h-5" />
              Chat History
            </h2>
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* New Chat Button */}
          <button
            onClick={startNewChat}
            className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg px-4 py-2 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {chatHistory.length === 0 ? (
            <div className="text-center text-white/50 py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No chat history yet</p>
            </div>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="group bg-white/5 hover:bg-white/10 rounded-lg p-3 cursor-pointer transition-all"
                onClick={() => loadChatFromHistory(chat)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{chat.title}</h3>
                    <p className="text-xs text-white/60 mt-1 line-clamp-2">{chat.preview}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-white/40" />
                      <span className="text-xs text-white/40">
                        {chat.timestamp.toLocaleDateString()}
                      </span>
                      <span className="text-xs text-white/40">•</span>
                      <span className="text-xs text-white/40">{chat.messageCount} messages</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChatFromHistory(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left side - Menu button and Logo */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Ploymind AI
                  </h1>
                  <p className="text-xs text-white/60">Your Intelligent Assistant</p>
                </div>
              </div>

              {/* Right side - Model Selector and Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 flex items-center gap-2 hover:bg-white/20 transition-all"
                >
                  <span className="text-lg">
                    {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.emoji || "🤖"}
                  </span>
                  <span className="text-sm font-medium hidden sm:block">
                    {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || "Select Model"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-white/60" />
                </button>

                {/* Connection Status */}
                <div className="flex items-center gap-1">
                  {connectionStatus === 'connected' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {connectionStatus === 'connecting' && <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />}
                  {connectionStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>
              </div>
            </div>
          </div>

          {/* Model Selector Dropdown */}
          {showModelSelector && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-w-md mx-auto z-20">
              <h3 className="text-sm font-semibold text-white/90 mb-3">Choose AI Model</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {AVAILABLE_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelSelector(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedModel === model.id
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{model.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white/90">{model.name}</div>
                        <div className="text-xs text-white/60">{model.provider} • {model.description}</div>
                      </div>
                      {selectedModel === model.id && (
                        <Zap className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] ${message.role === "user" ? "order-first" : ""}`}>
                    <div
                      className={`rounded-2xl p-4 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "bg-black/30 backdrop-blur-sm border border-white/10 text-white/90"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.model && <span>• {message.model}</span>}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-sm text-white/70">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Sticky */}
        <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-4">
          {error && (
            <div className="max-w-4xl mx-auto mb-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-3 flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Ploymind AI..."
                className="flex-1 bg-transparent text-white placeholder:text-white/50 border-none outline-none resize-none max-h-32 min-h-[24px]"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '24px',
                  maxHeight: '128px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
              />

              {/* Send Button */}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`p-3 rounded-xl transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                } border border-white/20`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
