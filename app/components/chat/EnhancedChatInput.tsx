// Enhanced Chat Input with voice, file upload, and advanced features
import { useState, useRef } from "react";
import type { KeyboardEvent } from "react";
import { 
  Send, 
  Loader2, 
  Mic, 
  MicOff, 
  Paperclip, 
  Image, 
  FileText,
  X
} from "lucide-react";

interface EnhancedChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  isLoading: boolean;
  error?: string | null;
  onClearError?: () => void;
  placeholder?: string;
  className?: string;
  enableVoice?: boolean;
  enableFileUpload?: boolean;
  onVoiceRecord?: () => void;
  onFileUpload?: (file: File) => void;
}

export default function EnhancedChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  error,
  onClearError,
  placeholder = "Message Ploymind AI...",
  className = "",
  enableVoice = true,
  enableFileUpload = true,
  onVoiceRecord,
  onFileUpload
}: EnhancedChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || attachments.length > 0) && !isLoading) {
        handleSendMessage();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
  };

  const handleSendMessage = () => {
    if ((value.trim() || attachments.length > 0) && !isLoading) {
      let messageContent = value.trim();
      
      // Add attachment info to message if files are attached
      if (attachments.length > 0) {
        const attachmentInfo = attachments.map(file => `[Attached: ${file.name}]`).join(' ');
        messageContent = messageContent ? `${messageContent}\n\n${attachmentInfo}` : attachmentInfo;
      }
      
      onSend(messageContent);
      setAttachments([]);
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      // Stop recording logic here
    } else {
      setIsRecording(true);
      onVoiceRecord?.();
      // Start recording logic here
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    
    // Handle file upload
    files.forEach(file => {
      onFileUpload?.(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`sticky bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-4 ${className}`}>
      {error && (
        <div className="max-w-4xl mx-auto mb-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={onClearError}
              className="text-red-400 hover:text-red-300 ml-2"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div 
                key={index}
                className="bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2 text-sm"
              >
                {file.type.startsWith('image/') ? (
                  <Image className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span className="text-white/80 truncate max-w-32">
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-white/60 hover:text-white/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-3 flex items-end gap-3">
          {/* Voice Recording Button */}
          {enableVoice && (
            <button
              onClick={handleVoiceToggle}
              className={`p-3 rounded-xl transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20'
              } border border-white/20`}
              disabled={isLoading}
              aria-label={isRecording ? "Stop recording" : "Start voice recording"}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white/70" />
              )}
            </button>
          )}

          {/* File Attachment Button */}
          {enableFileUpload && (
            <button
              onClick={handleAttachClick}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              disabled={isLoading}
              aria-label="Attach file"
            >
              <Paperclip className="w-5 h-5 text-white/70" />
            </button>
          )}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-white placeholder:text-white/50 border-none outline-none resize-none max-h-32 min-h-[24px]"
            rows={1}
            style={{
              height: 'auto',
              minHeight: '24px',
              maxHeight: '128px'
            }}
            disabled={isLoading}
          />

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!(value.trim() || attachments.length > 0) || isLoading}
            className={`p-3 rounded-xl transition-all ${
              (value.trim() || attachments.length > 0) && !isLoading
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            } border border-white/20`}
            aria-label={isLoading ? "Sending..." : "Send message"}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Input hints */}
        <div className="text-center mt-2">
          <p className="text-xs text-white/40">
            Press Enter to send, Shift+Enter for new line
            {enableVoice && " • Hold mic to record"}
            {enableFileUpload && " • Click paperclip to attach files"}
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        multiple
        accept="image/*,text/*,.pdf,.doc,.docx"
      />
    </div>
  );
}
