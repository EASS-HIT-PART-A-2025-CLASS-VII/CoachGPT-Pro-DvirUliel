import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LoginRegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden">
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
      
      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="mx-auto w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 mb-3">
            <img 
              src="/coachgpt_pro_logo.PNG" 
              alt="CoachGPT Pro"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-gray-900 mb-4"
        >
          Coach<span className="text-orange-500">GPT</span>
          <div className="text-orange-500 text-2xl md:text-3xl font-light">Pro</div>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Your AI-Powered Fitness Coach
          <br />
          <span className="text-base text-gray-600">
            Build personalized workout plans. Get smart coaching in real time.
          </span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link
            to="/register"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <div className="bg-white border-2 border-gray-300 rounded-xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:border-blue-400 hover:-translate-y-2 shadow-md">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl">🏋️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Workouts</h3>
            <p className="text-gray-700 font-medium">AI-generated plans tailored to your goals and fitness level</p>
          </div>
          
          <div className="bg-white border-2 border-gray-300 rounded-xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:border-blue-400 hover:-translate-y-2 shadow-md">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI Coach</h3>
            <p className="text-gray-700 font-medium">Get instant advice and motivation from your personal AI trainer</p>
          </div>
          
          <div className="bg-white border-2 border-gray-300 rounded-xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:border-blue-400 hover:-translate-y-2 shadow-md">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl">📱</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Track Progress</h3>
            <p className="text-gray-700 font-medium">Monitor your journey with detailed analytics and insights</p>
          </div>
        </motion.div>

        {/* Optional Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-500">
            Join thousands of users transforming their fitness journey
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginRegisterPage;