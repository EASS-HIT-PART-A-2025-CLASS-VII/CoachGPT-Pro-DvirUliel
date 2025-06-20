import React from 'react';
import { motion } from 'framer-motion';

const PlanArchivePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-gray-900">Plan Archive</h1>
              <p className="mt-2 text-gray-600">
                View and manage your workout plan history
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🗂️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Plan Archive Coming Soon
          </h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            This feature will allow you to view, duplicate, and manage your past workout plans.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PlanArchivePage;