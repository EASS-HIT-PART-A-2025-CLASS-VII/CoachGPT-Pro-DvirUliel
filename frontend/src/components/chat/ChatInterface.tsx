import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '../../types/chat';
import ChatMessageComponent from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  disabled = false,
}) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Handle scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setShowScrollToBottom(!isNearBottom && messages.length > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom || messages.length === 1) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
        {messages.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              Ask me anything about fitness, workouts, nutrition, or exercise techniques!
            </p>
          </div>
        ) : (
          // Messages
          <>
            {messages.map((message) => (
              <ChatMessageComponent
                key={message.id}
                message={message}
              />
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <TypingIndicator />
            )}
          </>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-8 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Input */}
      <div className="border border-gray-200 bg-white px-4 py-4">
        <ChatInput
          onSendMessage={onSendMessage}
          disabled={disabled || isLoading}
          placeholder={
            disabled 
              ? "Chat is currently disabled" 
              : isLoading 
                ? "AI is thinking..." 
                : "Ask your AI fitness coach anything..."
          }
        />
        
        {/* Helpful Suggestions */}
        {messages.length <= 1 && !isLoading && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "What's the best workout for beginners?",
              "How many calories should I eat?",
              "Explain proper squat form",
              "Create a home workout routine"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => !disabled && !isLoading && onSendMessage(suggestion)}
                disabled={disabled || isLoading}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;