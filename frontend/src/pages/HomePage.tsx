import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import workoutService from '../services/workoutService';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  gradient: string;
  features: string[];
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [hasWorkoutPlan, setHasWorkoutPlan] = useState(false);
  const [isCheckingPlan, setIsCheckingPlan] = useState(true);

  // Check if user has a workout plan
  useEffect(() => {
    const checkUserPlan = async () => {
      if (!user?.id) {
        setIsCheckingPlan(false);
        return;
      }

      try {
        const plan = await workoutService.getUserPlan(user.id);
        setHasWorkoutPlan(!!plan && !!plan.plan_data);
      } catch (error) {
        // No plan found or error - user doesn't have a plan
        setHasWorkoutPlan(false);
      } finally {
        setIsCheckingPlan(false);
      }
    };

    checkUserPlan();
  }, [user]);

  const features: FeatureCard[] = [
    {
      id: 'workout-plan',
      title: 'Workout Plan',
      description: 'Create and manage your personalized workout routines with AI-powered recommendations.',
      icon: '🏋️',
      path: '/plan',
      gradient: 'from-blue-500 to-blue-600',
      features: [
        'AI-generated workout plans',
        'Customizable exercise routines',
        'Progress tracking',
        'Goal-oriented programs'
      ]
    },
    {
      id: 'ai-coach',
      title: 'AI Fitness Coach',
      description: 'Get instant advice, motivation, and answers to all your fitness questions from your personal AI trainer.',
      icon: '🤖',
      path: '/chat',
      gradient: 'from-purple-500 to-purple-600',
      features: [
        'Real-time fitness advice',
        'Personalized coaching',
        'Exercise form guidance',
        'Nutrition recommendations'
      ]
    },
    {
      id: 'exercise-library',
      title: 'Exercise Library',
      description: 'Explore a comprehensive database of exercises with detailed instructions and filtering options.',
      icon: '📚',
      path: '/exercises',
      gradient: 'from-green-500 to-green-600',
      features: [
        'Extensive exercise database',
        'Detailed instructions',
        'Filter by muscle group',
        'Difficulty levels'
      ]
    },
    {
      id: 'plan-archive',
      title: 'Plan Archive',
      description: 'View and manage your workout plan history, duplicate successful routines, and track your fitness journey.',
      icon: '🗂️',
      path: '/archive',
      gradient: 'from-orange-500 to-orange-600',
      features: [
        'Plan history tracking',
        'Duplicate successful plans',
        'Performance analytics',
        'Journey visualization'
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -8,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Logo Section */}
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mx-auto w-32 h-32 mb-6"
            >
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjMwMCIgY3k9IjMwMCIgcj0iMjgwIiBzdHJva2U9IiMxZTQwYWYiIHN0cm9rZS13aWR0aD0iMTAiIGZpbGw9Im5vbmUiLz4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTUwLDE0MClzY2FsZSgwLjcpIj4KPHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDMwMCAzMjAiPgo8IS0tIEJ1bGwgSGVhZCAtLT4KPHBhdGggZD0iTTE1MCA0MEM3MCA0MCAyMCA5MCAyMCAxNDBTNzAgMjQwIDE1MCAyNDBTMjgwIDI0MCAyODAgMTQwUzIzMCA0MCAxNTAgNDBaIiBmaWxsPSIjMWU0MGFmIi8+CjwhLS0gSG9ybnMgLS0+CjxwYXRoIGQ9Ik0xMTAgODBDMTA1IDYwIDk1IDQ1IDg1IDQwQzgwIDM1IDcwIDM1IDY1IDQ1QzYwIDU1IDY1IDcwIDc1IDgwWiIgZmlsbD0iI2Y5NzMxNiIvPgo8cGF0aCBkPSJNMTkwIDgwQzE5NSA2MCAyMDUgNDUgMjE1IDQwQzIyMCAzNSAyMzAgMzUgMjM1IDQ1QzI0MCA1NSAyMzUgNzAgMjI1IDgwWiIgZmlsbD0iI2Y5NzMxNiIvPgo8IS0tIEV5ZXMgLS0+CjxjaXJjbGUgY3g9IjEyMCIgY3k9IjEyMCIgcj0iOCIgZmlsbD0iI2Y5NzMxNiIvPgo8Y2lyY2xlIGN4PSIxODAiIGN5PSIxMjAiIHI9IjgiIGZpbGw9IiNmOTczMTYiLz4KPHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMwMCAyNDAiPgo8IS0tIE11c2N1bGFyIEJvZHkgLS0+CjxyZWN0IHg9IjEwMCIgeT0iMjIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgcng9IjIwIiBmaWxsPSIjMWU0MGFmIi8+CjwhLS0gUGVjdG9yYWxzIC0tPgo8ZWxsaXBzZSBjeD0iODAiIGN5PSIyNjAiIHJ4PSIzNSIgcnk9IjI1IiBmaWxsPSIjMWU0MGFmIi8+CjxlbGxpcHNlIGN4PSIyMjAiIGN5PSIyNjAiIHJ4PSIzNSIgcnk9IjI1IiBmaWxsPSIjMWU0MGFmIi8+CjwhLS0gQWJzIC0tPgo8cmVjdCB4PSIxMjAiIHk9IjI4MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjIwIiByeD0iMyIgZmlsbD0iI2Y5NzMxNiIvPgo8cmVjdCB4PSIxNDAiIHk9IjI4MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjIwIiByeD0iMyIgZmlsbD0iI2Y5NzMxNiIvPgo8cmVjdCB4PSIxNjAiIHk9IjI4MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjIwIiByeD0iMyIgZmlsbD0iI2Y5NzMxNiIvPgo8IS0tIEFybXMgLS0+CjxjaXJjbGUgY3g9IjYwIiBjeT0iMjgwIiByPSIyNSIgZmlsbD0iIzFlNDBhZiIvPgo8Y2lyY2xlIGN4PSI2MCIgY3k9IjMyMCIgcj0iMjAiIGZpbGw9IiMxZTQwYWYiLz4KPGNpcmNsZSBjeD0iMjQwIiBjeT0iMjgwIiByPSIyNSIgZmlsbD0iIzFlNDBhZiIvPgo8Y2lyY2xlIGN4PSIyNDAiIGN5PSIzMjAiIHI9IjIwIiBmaWxsPSIjMWU0MGFmIi8+CjwvZz4KPC9zdmc+" 
                alt="CoachGPT Pro"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-gray-800 mb-2"
            >
              Coach<span className="text-orange-500">GPT</span>
              <div className="text-orange-500 text-2xl md:text-3xl font-light">Pro</div>
            </motion.h1>
          </div>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Welcome back, {user?.name || 'Fitness Enthusiast'}! 👋
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your AI-powered fitness companion is ready to help you achieve your goals. 
              Explore personalized workout plans, get expert advice, and track your progress 
              all in one intelligent platform.
            </p>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              whileHover="hover"
              className="group"
            >
              <Link to={feature.path}>
                <motion.div
                  variants={cardHoverVariants}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 h-full border border-gray-100 group-hover:border-gray-200"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        {feature.icon}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                          {feature.title}
                        </h3>
                        <div className="w-6 h-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full mt-1"></div>
                      </div>
                    </div>
                    <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                      <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 leading-relaxed text-base">
                    {feature.description}
                  </p>

                  {/* Feature List */}
                  <div className="space-y-2">
                    {feature.features.map((item, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className={`inline-flex items-center text-sm font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-orange-600 transition-all duration-300`}>
                      Explore {feature.title}
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Your Fitness Platform Features
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">AI</div>
              <div className="text-sm text-gray-600">Powered Coach</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">125</div>
              <div className="text-sm text-gray-600">Exercises</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
              <div className="text-sm text-gray-600">Custom Plans</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Fitness Journey?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Whether you're a beginner or an experienced athlete, our AI-powered platform 
              adapts to your needs and helps you achieve your fitness goals faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/plan"
                className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-300 inline-flex items-center justify-center"
              >
                <span className="mr-2">🏋️</span>
                {isCheckingPlan ? 'Loading...' : (hasWorkoutPlan ? 'View Workout Plan' : 'Create Workout Plan')}
              </Link>
              <Link
                to="/chat"
                className="bg-transparent border-2 border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-300 inline-flex items-center justify-center"
              >
                <span className="mr-2">🤖</span>
                Chat with AI Coach
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;