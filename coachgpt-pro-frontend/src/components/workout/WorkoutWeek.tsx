import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutWeek as WorkoutWeekType, WorkoutPlan } from '../../types/workout';
import WorkoutDay from './WorkoutDay';

interface WorkoutWeekProps {
  week: WorkoutWeekType;
  planId: string;
  onPlanUpdated: (plan: WorkoutPlan) => void;
}

const WorkoutWeek: React.FC<WorkoutWeekProps> = ({ week, planId, onPlanUpdated }) => {
  const [isExpanded, setIsExpanded] = useState(week.week === 1); // First week expanded by default

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: week.week * 0.1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Week Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-brand-blue to-brand-orange rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">{week.week}</span>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">
              Week {week.week}
            </h3>
            <p className="text-sm text-gray-600">
              {week.days.length} workout{week.days.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Week Status Badge */}
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {week.week === 1 ? 'Current' : week.week <= 2 ? 'Upcoming' : 'Future'}
          </span>
          
          {/* Expand/Collapse Icon */}
          <motion.svg
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </button>

      {/* Week Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200"
          >
            <div className="p-6 space-y-4">
              {week.days.map((day, dayIndex) => (
                <WorkoutDay
                  key={`${week.week}-${dayIndex}`}
                  day={day}
                  weekNumber={week.week}
                  planId={planId}
                  onPlanUpdated={onPlanUpdated}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorkoutWeek;