import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-brand-orange opacity-20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 bg-white opacity-10 rounded-full"
          animate={{
            scale: [1, 0.8, 1],
            y: [-10, 10, -10],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-16 h-16 bg-brand-orange opacity-30 rounded-full"
          animate={{
            x: [-10, 10, -10],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="mx-auto w-40 h-40 mb-6">
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjMwMCIgY3k9IjMwMCIgcj0iMjgwIiBzdHJva2U9IiMxZTQwYWYiIHN0cm9rZS13aWR0aD0iMTAiIGZpbGw9Im5vbmUiLz4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTUwLDE0MClzY2FsZSgwLjcpIj4KPHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDMwMCAzMjAiPgo8IS0tIEJ1bGwgSGVhZCAtLT4KPHBhdGggZD0iTTE1MCA0MEM3MCA0MCAyMCA5MCAyMCAxNDBTNzAgMjQwIDE1MCAyNDBTMjgwIDI0MCAyODAgMTQwUzIzMCA0MCAxNTAgNDBaIiBmaWxsPSIjMWU0MGFmIi8+CjwhLS0gSG9ybnMgLS0+CjxwYXRoIGQ9Ik0xMTAgODBDMTA1IDYwIDk1IDQ1IDg1IDQwQzgwIDM1IDcwIDM1IDY1IDQ1QzYwIDU1IDY1IDcwIDc1IDgwWiIgZmlsbD0iI2Y5NzMxNiIvPgo8cGF0aCBkPSJNMTkwIDgwQzE5NSA2MCAyMDUgNDUgMjE1IDQwQzIyMCAzNSAyMzAgMzUgMjM1IDQ1QzI0MCA1NSAyMzUgNzAgMjI1IDgwWiIgZmlsbD0iI2Y5NzMxNiIvPgo8IS0tIEV5ZXMgLS0+CjxjaXJjbGUgY3g9IjEyMCIgY3k9IjEyMCIgcj0iOCIgZmlsbD0iI2Y5NzMxNiIvPgo8Y2lyY2xlIGN4PSIxODAiIGN5PSIxMjAiIHI9IjgiIGZpbGw9IiNmOTczMTYiLz4KPHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMwMCAyNDAiPgo8IS0tIE11c2N1bGFyIEJvZHkgLS0+CjxyZWN0IHg9IjEwMCIgeT0iMjIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgcng9IjIwIiBmaWxsPSIjMWU0MGFmIi8+CjwhLS0gUGVjdG9yYWxzIC0tPgo8ZWxsaXBzZSBjeD0iODAiIGN5PSIyNjAiIHJ4PSIzNSIgcnk9IjI1IiBmaWxsPSIjMWU0MGFmIi8+CjxlbGxpcHNlIGN4PSIyMjAiIGN5PSIyNjAiIHJ4PSIzNSIgcnk9IjI1IiBmaWxsPSIjMWU0MGFmIi8+CjwhLS0gQWJzIC0tPgo8cmVjdCB4PSIxMjAiIHk9IjI4MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjIwIiByeD0iMyIgZmlsbD0iI2Y5NzMxNiIvPgo8cmVjdCB4PSIxNDAiIHk9IjI4MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjIwIiByeD0iMyIgZmlsbD0iI2Y5NzMxNiIvPgo8cmVjdCB4PSIxNjAiIHk9IjI4MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjIwIiByeD0iMyIgZmlsbD0iI2Y5NzMxNiIvPgo8IS0tIEFybXMgLS0+CjxjaXJjbGUgY3g9IjYwIiBjeT0iMjgwIiByPSIyNSIgZmlsbD0iIzFlNDBhZiIvPgo8Y2lyY2xlIGN4PSI2MCIgY3k9IjMyMCIgcj0iMjAiIGZpbGw9IiMxZTQwYWYiLz4KPGNpcmNsZSBjeD0iMjQwIiBjeT0iMjgwIiByPSIyNSIgZmlsbD0iIzFlNDBhZiIvPgo8Y2lyY2xlIGN4PSIyNDAiIGN5PSIzMjAiIHI9IjIwIiBmaWxsPSIjMWU0MGFmIi8+CjwvZz4KPC9zdmc+" 
              alt="CoachGPT Pro"
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold text-white mb-4"
        >
          Coach<span className="text-brand-orange">GPT</span>
          <div className="text-brand-orange text-3xl md:text-4xl font-light">Pro</div>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Your AI-Powered Fitness Coach
          <br />
          <span className="text-lg text-gray-300">
            Build personalized workout plans. Get smart coaching in real time.
          </span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to="/register"
            className="bg-brand-orange hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-navy font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="glass-effect rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🏋️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Workouts</h3>
            <p className="text-gray-300">AI-generated plans tailored to your goals and fitness level</p>
          </div>
          <div className="glass-effect rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Coach</h3>
            <p className="text-gray-300">Get instant advice and motivation from your personal AI trainer</p>
          </div>
          <div className="glass-effect rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-white mb-2">Track Progress</h3>
            <p className="text-gray-300">Monitor your journey with detailed analytics and insights</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;