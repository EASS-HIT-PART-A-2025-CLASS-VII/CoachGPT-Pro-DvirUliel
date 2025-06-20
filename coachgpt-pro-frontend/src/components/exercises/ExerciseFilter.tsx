import React from 'react';
import { motion } from 'framer-motion';
import { ExerciseFilters } from '../../types/exercise';
import { MUSCLE_GROUPS, WORKOUT_CONFIG } from '../../utils/constants';

interface ExerciseFilterProps {
  filters: ExerciseFilters;
  onFilterChange: (filters: ExerciseFilters) => void;
  onClearFilters: () => void;
  exerciseCount: number;
  totalCount: number;
}

const ExerciseFilter: React.FC<ExerciseFilterProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  exerciseCount,
  totalCount,
}) => {
  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search });
  };

  const handleMuscleGroupChange = (muscleGroup: string) => {
    onFilterChange({ 
      ...filters, 
      muscleGroup: muscleGroup === filters.muscleGroup ? undefined : muscleGroup 
    });
  };

  const handleDifficultyChange = (difficulty: string) => {
    onFilterChange({ 
      ...filters, 
      difficulty: difficulty === filters.difficulty ? undefined : difficulty 
    });
  };

  const hasFilters = filters.search || filters.muscleGroup || filters.difficulty;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-brand-blue hover:text-blue-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{exerciseCount}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalCount}</span> exercises
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Search Exercises
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or description..."
            className="input-primary pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Muscle Groups */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Muscle Groups
        </label>
        <div className="space-y-2">
          {MUSCLE_GROUPS.map((group) => (
            <label
              key={group}
              className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md"
            >
              <input
                type="checkbox"
                checked={filters.muscleGroup === group}
                onChange={() => handleMuscleGroupChange(group)}
                className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700 capitalize">{group}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulty Levels */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Difficulty Level
        </label>
        <div className="space-y-2">
          {WORKOUT_CONFIG.DIFFICULTY_LEVELS.map((level) => (
            <label
              key={level.value}
              className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md"
            >
              <input
                type="radio"
                name="difficulty"
                checked={filters.difficulty === level.value}
                onChange={() => handleDifficultyChange(level.value)}
                className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300"
              />
              <span className="ml-3 text-sm text-gray-700">{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h4>
        <div className="space-y-2">
          <button
            onClick={() => onFilterChange({ difficulty: 'beginner' })}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
          >
            Beginner Friendly
          </button>
          <button
            onClick={() => onFilterChange({ muscleGroup: 'chest' })}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
          >
            Chest Exercises
          </button>
          <button
            onClick={() => onFilterChange({ search: 'bodyweight' })}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
          >
            No Equipment
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExerciseFilter;