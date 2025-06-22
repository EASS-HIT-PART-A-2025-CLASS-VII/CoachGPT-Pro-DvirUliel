import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import chatService from '../services/chatService';
import { ChatMessage } from '../types/chat';
import ChatInterface from '../components/chat/ChatInterface';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [llmHealth, setLlmHealth] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check LLM service health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await chatService.checkLLMHealth();
        setLlmHealth('healthy');
      } catch (error) {
        setLlmHealth('unhealthy');
        toast.error('AI chat service is currently unavailable');
      }
    };

    checkHealth();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message
  useEffect(() => {
    if (messages.length === 0 && llmHealth === 'healthy') {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi ${user?.name || 'there'}! 👋 I'm your AI fitness coach. I'm here to help you with workout advice, exercise techniques, nutrition tips, and answer any fitness-related questions you might have. What would you like to know?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [user, llmHealth, messages.length]);

  const handleSendMessage = async (messageContent: string) => {
    if (!user || llmHealth !== 'healthy') return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const validationErrors = chatService.validateChatRequest({
        userId: user.id,
        message: messageContent,
      });

      if (validationErrors.length > 0) {
        toast.error(validationErrors[0]);
        setIsLoading(false);
        return;
      }

      // Use regular chat endpoint (not streaming)
      const response = await chatService.sendMessage({
        userId: user.id,
        message: messageContent,
      });

      // Handle different response structures
      let responseContent = '';
      if (response?.data?.response) {
        responseContent = response.data.response;
      } else if (response?.response) {
        responseContent = response.response;
      } else if (typeof response === 'string') {
        responseContent = response;
      } else {
        responseContent = 'Sorry, I received an invalid response. Please try again.';
      }

      // Create assistant message with the response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setIsLoading(false);
    setMessages([]);
    
    // Re-add welcome message
    setTimeout(() => {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-new',
        role: 'assistant',
        content: `Chat cleared! I'm ready to help you with your fitness journey. What would you like to discuss?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  if (llmHealth === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Connecting to AI coach...</p>
        </div>
      </div>
    );
  }

  if (llmHealth === 'unhealthy') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Coach Unavailable</h2>
          <p className="text-gray-600 mb-4">
            The AI chat service is currently offline. Please check back later or contact support if this issue persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 flex-shrink-0">
              <img 
                src="/coachgpt_pro_logo.PNG" 
                alt="CoachGPT Pro AI Coach"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">AI Fitness Coach</h1>
              <p className="text-sm text-gray-600">
                Get personalized workout advice and fitness tips
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>

            {/* Clear Chat Button */}
            <button
              onClick={clearChat}
              className="btn-secondary text-sm"
              disabled={isLoading}
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={llmHealth !== 'healthy'}
        />
      </div>

      {/* Scroll to bottom marker */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatPage;