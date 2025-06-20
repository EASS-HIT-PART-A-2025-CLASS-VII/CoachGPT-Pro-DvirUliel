import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start"
    >
      <div className="flex items-start space-x-3 max-w-[80%]">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-blue to-brand-orange text-white flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold">🤖</span>
        </div>

        {/* Typing Bubble */}
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600 mr-2">AI Coach is typing</span>
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;