import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={`flex items-end space-x-3 p-3 border rounded-xl transition-all duration-200 ${
          isFocused
            ? 'border-brand-blue shadow-md'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        {/* Message Input */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none border-none outline-none bg-transparent placeholder-gray-500 text-gray-900 disabled:cursor-not-allowed"
            style={{ minHeight: '20px', maxHeight: '120px' }}
          />
        </div>

        {/* Send Button */}
        <motion.button
          type="submit"
          disabled={!canSend}
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.95 } : {}}
          className={`p-2 rounded-lg transition-all duration-200 ${
            canSend
              ? 'bg-brand-blue hover:bg-blue-700 text-white shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </motion.button>
      </div>

      {/* Character Counter */}
      {message.length > 1500 && (
        <div className="absolute -top-6 right-0 text-xs text-gray-500">
          {message.length}/2000
        </div>
      )}

      {/* Keyboard Hint */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Press Enter to send, Shift + Enter for new line
      </div>
    </form>
  );
};

export default ChatInput;