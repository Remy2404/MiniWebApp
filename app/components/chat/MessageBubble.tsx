// Enhanced Message Component with tools and actions
import { useState } from "react";
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  MoreHorizontal, 
  Edit3, 
  RefreshCw, 
  Volume2,
  Heart,
  Star,
  Trash2
} from "lucide-react";
import type { Message } from "./types";

interface MessageBubbleProps {
  message: Message;
  onCopy?: (content: string) => void;
  onEdit?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  onSpeak?: (content: string) => void;
  onLike?: (messageId: string) => void;
  onSave?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  showActions?: boolean;
}

export default function MessageBubble({
  message,
  onCopy,
  onEdit,
  onRegenerate,
  onSpeak,
  onLike,
  onSave,
  onDelete,
  showActions = true
}: MessageBubbleProps) {
  const [showTools, setShowTools] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(message.content);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const tools = [
    {
      id: 'copy',
      icon: copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />,
      label: copied ? 'Copied!' : 'Copy',
      onClick: handleCopy,
      color: copied ? 'text-green-400' : 'text-white/70'
    },
    ...(message.role === 'user' ? [
      {
        id: 'edit',
        icon: <Edit3 className="w-3 h-3" />,
        label: 'Edit',
        onClick: () => onEdit?.(message.id),
        color: 'text-white/70'
      }
    ] : []),
    ...(message.role === 'assistant' ? [
      {
        id: 'regenerate',
        icon: <RefreshCw className="w-3 h-3" />,
        label: 'Regenerate',
        onClick: () => onRegenerate?.(message.id),
        color: 'text-white/70'
      },
      {
        id: 'speak',
        icon: <Volume2 className="w-3 h-3" />,
        label: 'Speak',
        onClick: () => onSpeak?.(message.content),
        color: 'text-white/70'
      }
    ] : []),
    {
      id: 'like',
      icon: <Heart className="w-3 h-3" />,
      label: 'Like',
      onClick: () => onLike?.(message.id),
      color: 'text-white/70'
    },
    {
      id: 'save',
      icon: <Star className="w-3 h-3" />,
      label: 'Save',
      onClick: () => onSave?.(message.id),
      color: 'text-white/70'
    },
    {
      id: 'delete',
      icon: <Trash2 className="w-3 h-3" />,
      label: 'Delete',
      onClick: () => onDelete?.(message.id),
      color: 'text-red-400'
    }
  ];

  return (
    <div className="group">
      <div className={`flex gap-4 ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}>
        {/* Assistant Avatar */}
        {message.role === "assistant" && (
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}
        
        <div className={`max-w-[85%] ${
          message.role === "user" ? "order-first" : ""
        }`}>
          {/* Message Bubble */}
          <div
            className={`rounded-2xl p-4 ${
              message.role === "user"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "bg-black/30 backdrop-blur-sm border border-white/10 text-white/90"
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          
          {/* Message Info and Actions */}
          <div className="flex items-center justify-between mt-2 text-xs text-white/40">
            <div className="flex items-center gap-2">
              <span>{message.timestamp.toLocaleTimeString()}</span>
              {message.model && message.role === "assistant" && (
                <>
                  <span>•</span>
                  <span>{message.model}</span>
                </>
              )}
            </div>
            
            {/* Action Tools */}
            {showActions && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {tools.slice(0, 3).map((tool) => (
                  <button
                    key={tool.id}
                    onClick={tool.onClick}
                    className={`p-1 hover:bg-white/10 rounded-md transition-colors ${tool.color}`}
                    title={tool.label}
                  >
                    {tool.icon}
                  </button>
                ))}
                
                {tools.length > 3 && (
                  <button
                    onClick={() => setShowTools(!showTools)}
                    className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/70"
                    title="More tools"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Extended Tools Menu */}
          {showTools && tools.length > 3 && (
            <div className="mt-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-2 flex flex-wrap gap-1">
              {tools.slice(3).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    tool.onClick();
                    setShowTools(false);
                  }}
                  className={`flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded-lg transition-colors text-xs ${tool.color}`}
                >
                  {tool.icon}
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Avatar */}
        {message.role === "user" && (
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
