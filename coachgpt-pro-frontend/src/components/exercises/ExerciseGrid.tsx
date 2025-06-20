import React from 'react';
import { motion } from 'framer-motion';
import { ExerciseDetails } from '../../types/exercise';

interface ExerciseGridProps {
  exercises: ExerciseDetails[];
}

const ExerciseGrid: React.FC<ExerciseGridProps> = ({ exercises }) => {
  const getMuscleGroupColor = (muscleGroup: string): string => {
    const colorMap: { [key: string]: string } = {
      chest: 'bg-red-100 text-red-800',
      back: 'bg-blue-100 text-blue-800',
      shoulders: 'bg-yellow-100 text-yellow-800',
      arms: 'bg-purple-100 text-purple-800',
      legs: 'bg-green-100 text-green-800',
      core: 'bg-orange-100 text-orange-800',
      cardio: 'bg-pink-100 text-pink-800',
    };
    return colorMap[muscleGroup.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colorMap: { [key: string]: string } = {
      beginner: 'bg-green-500',
      intermediate: 'bg-yellow-500',
      advanced: 'bg-red-500',
    };
    return colorMap[difficulty] || 'bg-gray-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exercises.map((exercise, index) => (
        <motion.div
          key={exercise.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="exercise-card group"
        >
          {/* Exercise Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-blue transition-colors">
                {exercise.name}
              </h3>
              <div className="flex items-center mt-2 space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMuscleGroupColor(exercise.muscle_group)}`}>
                  {exercise.muscle_group}
                </span>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${getDifficultyColor(exercise.difficulty)} mr-1`} />
                  <span className="text-xs text-gray-600 capitalize">{exercise.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Description */}
          {exercise.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {exercise.description}
            </p>
          )}

          {/* Equipment Required */}
          {exercise.equipment_required && exercise.equipment_required.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Equipment:</p>
              <div className="flex flex-wrap gap-1">
                {exercise.equipment_required.slice(0, 3).map((equipment, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {equipment}
                  </span>
                ))}
                {exercise.equipment_required.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    +{exercise.equipment_required.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button className="text-sm text-brand-blue hover:text-blue-700 font-medium">
              View Details
            </button>
            <button className="p-2 text-gray-400 hover:text-brand-blue rounded-lg hover:bg-blue-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ExerciseGrid;