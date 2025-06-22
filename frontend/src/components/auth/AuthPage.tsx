import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthPageProps {
  mode: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(mode);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden p-4 py-8">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
      
      {/* Animated Bubble Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-24 h-24 bg-blue-300 opacity-20 rounded-full"
          animate={{
            x: [0, 25, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-24 right-24 w-32 h-32 bg-blue-400 opacity-15 rounded-full"
          animate={{
            x: [-20, 20, -20],
            y: [-10, 15, -10],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 left-12 w-16 h-16 bg-orange-300 opacity-25 rounded-full"
          animate={{
            x: [-8, 12, -8],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/4 right-1/3 w-20 h-20 bg-blue-500 opacity-15 rounded-full"
          animate={{
            x: [0, 30, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-60 w-28 h-28 bg-orange-200 opacity-18 rounded-full"
          animate={{
            x: [0, -15, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-2/3 right-16 w-12 h-12 bg-blue-200 opacity-30 rounded-full"
          animate={{
            x: [-5, 15, -5],
            y: [-12, 8, -12],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-6"
        >
          <Link to="/" className="inline-block">
            <div className="mx-auto w-32 h-32 mb-2">
              <img 
                src="/coachgpt_pro_logo.PNG" 
                alt="CoachGPT Pro"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl font-bold text-gray-900 mb-1"
            >
              Coach<span className="text-orange-500">GPT</span>
              <div className="text-orange-500 text-xl font-light">Pro</div>
            </motion.h1>
          </Link>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white border-2 border-gray-300 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Tab Headers */}
          <div className="flex bg-gray-50 border-b border-gray-200">
            <button
              onClick={() => setCurrentMode('login')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
                currentMode === 'login'
                  ? 'bg-white text-gray-900 border-b-2 border-orange-500 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setCurrentMode('register')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
                currentMode === 'register'
                  ? 'bg-white text-gray-900 border-b-2 border-orange-500 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8 bg-white">
            <AnimatePresence mode="wait">
              {currentMode === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoginForm />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RegisterForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Link
            to="/"
            className="text-gray-600 hover:text-orange-500 transition-colors inline-flex items-center bg-white/80 px-4 py-2 rounded-lg border border-gray-300 hover:border-orange-400 shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;