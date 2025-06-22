import React from 'react';
import { motion } from 'framer-motion';
import { ChatMessage } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex max-w-[80%] ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        } items-start`}
      >
        {/* Avatar */}
        <div
          className={`w-12 h-12 flex items-center justify-center flex-shrink-0 ${
            isUser
              ? 'bg-brand-blue text-white rounded-full'
              : ''
          }`}
        >
          {isUser ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ) : (
            <img
              src="/coachgpt_pro_logo.PNG"
              alt="CoachGPT Pro"
              className="w-12 h-12 object-contain"
            />
          )}
        </div>

        {/* Message Bubble with spacing */}
        <div
          className={`rounded-2xl px-4 py-3 max-w-full ${
            isUser
              ? 'bg-brand-blue text-white rounded-br-md mr-3'
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm ml-3'
          }`}
        >
          {/* Message Content */}
          <div
            className={`text-sm leading-relaxed ${
              isUser ? 'text-white' : 'text-gray-900'
            }`}
          >
            {message.content.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < message.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>

          {/* Timestamp */}
          <div
            className={`text-xs mt-2 ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessageComponent;