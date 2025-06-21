// components/modals/ExerciseSelectionModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import exerciseService from '../../services/exerciseService';
import { ExerciseDetails } from '../../types/exercise';
import toast from 'react-hot-toast';

interface ExerciseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseDetails) => void;
  title: string;
  muscleGroup?: string;
  difficulty?: string;
  currentExercise?: string;
  existingExercises?: string[]; // List of exercises already in the plan
  mode: 'add' | 'swap';
}

const ExerciseSelectionModal: React.FC<ExerciseSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title,
  muscleGroup,
  difficulty,
  currentExercise,
  existingExercises = [],
  mode
}) => {
  const [exercises, setExercises] = useState<ExerciseDetails[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(muscleGroup || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulty || '');

  // Available options
  const muscleGroups = exerciseService.getAvailableMuscleGroups();
  const difficulties = exerciseService.getAvailableDifficultyLevels();

  // Load exercises based on mode and filters
  const loadExercises = useCallback(async () => {
    if (!isOpen) return;

    setLoading(true);
    try {
      console.log('🔍 Loading exercises for modal...');

      // Always get all exercises - let the user filter with the UI controls
      const response = await exerciseService.getAllExercises();
      let exerciseData = response.exercises || [];

      console.log('📊 Total exercises from API:', exerciseData.length);

      // Only exclude the current exercise being swapped (if in swap mode)
      if (mode === 'swap' && currentExercise) {
        const currentExerciseName = currentExercise.toLowerCase().trim();
        exerciseData = exerciseData.filter(exercise => {
          const exerciseName = exercise.name.toLowerCase().trim();
          return exerciseName !== currentExerciseName;
        });
        console.log(`✅ Excluded current exercise "${currentExercise}", ${exerciseData.length} exercises remaining`);
      }

      setExercises(exerciseData);
    } catch (error: any) {
      console.error('❌ Failed to load exercises:', error);
      toast.error('Failed to load exercises');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [isOpen, mode, currentExercise]); // SIMPLIFIED dependencies

  // Load exercises when modal opens - only once
  useEffect(() => {
    if (isOpen) {
      loadExercises();
    } else {
      // Reset when modal closes
      setExercises([]);
      setFilteredExercises([]);
    }
  }, [isOpen]); // REMOVED loadExercises from dependencies to prevent re-runs

  // Filter exercises when exercises data or filters change
  useEffect(() => {
    console.log('🔍 Applying filters...');
    console.log('📋 Base exercises count:', exercises.length);
    console.log('🔍 Search query:', searchQuery);
    console.log('💪 Selected muscle group:', selectedMuscleGroup);
    console.log('🎯 Selected difficulty:', selectedDifficulty);

    let filtered = [...exercises];

    // Apply search filter
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm) ||
        exercise.description?.toLowerCase().includes(searchTerm) ||
        exercise.muscle_group?.toLowerCase().includes(searchTerm)
      );
      console.log(`🔍 After search filter: ${filtered.length} exercises`);
    }

    // Apply muscle group filter
    if (selectedMuscleGroup) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(exercise => {
        return exercise.muscle_group?.toLowerCase() === selectedMuscleGroup.toLowerCase();
      });
      console.log(`💪 After muscle group filter (${selectedMuscleGroup}): ${filtered.length}/${beforeCount} exercises`);
    }

    // Apply difficulty filter
    if (selectedDifficulty) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(exercise => {
        const exerciseDifficulty = exercise.difficulty?.toLowerCase?.() || exercise.difficulty;
        const selectedDifficultyLower = selectedDifficulty.toLowerCase();
        return exerciseDifficulty === selectedDifficultyLower;
      });
      console.log(`🎯 After difficulty filter (${selectedDifficulty}): ${filtered.length}/${beforeCount} exercises`);
    }

    console.log('✅ Final filtered exercises:', filtered.length);
    
    setFilteredExercises(filtered);
  }, [exercises, searchQuery, selectedMuscleGroup, selectedDifficulty]);

  // Handle exercise selection - FIXED validation
  const handleSelectExercise = (exercise: ExerciseDetails) => {
    // Validate exercise has required fields
    if (!exercise.name || !exercise.muscle_group) {
      toast.error('Invalid exercise selected - missing required fields');
      return;
    }

    // Additional validation for the exercise structure
    if (!exercise.difficulty) {
      toast.error('Invalid exercise selected - missing difficulty level');
      return;
    }

    console.log('✅ Exercise selected:', {
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      difficulty: exercise.difficulty,
      mode: mode
    });

    onSelect(exercise);
    onClose();
  };

  // Reset filters when modal closes
  const handleClose = () => {
    setSearchQuery('');
    setSelectedMuscleGroup(muscleGroup || '');
    setSelectedDifficulty(difficulty || '');
    onClose();
  };

  // Get exercise icon
  const getExerciseIcon = (exerciseName: string): string => {
    const name = exerciseName.toLowerCase();
    const iconMap: Record<string, string> = {
      squat: '🦵', lunge: '🦵', push: '💪', press: '💪', chest: '💪',
      pull: '🔝', row: '🔝', lat: '🔝', curl: '💪', extension: '💪',
      deadlift: '🏋️', plank: '🏃', crunch: '🏃', abs: '🏃',
      cardio: '❤️', run: '❤️', bike: '❤️'
    };
    
    const matchedKey = Object.keys(iconMap).find(key => name.includes(key));
    return iconMap[matchedKey || 'default'] || '⚡';
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get muscle group color
  const getMuscleGroupColor = (muscle: string): string => {
    const colorMap: Record<string, string> = {
      chest: 'text-red-600 bg-red-50',
      back: 'text-green-600 bg-green-50',
      shoulders: 'text-yellow-600 bg-yellow-50',
      biceps: 'text-blue-600 bg-blue-50',
      triceps: 'text-purple-600 bg-purple-50',
      legs: 'text-orange-600 bg-orange-50',
      core: 'text-indigo-600 bg-indigo-50',
    };
    return colorMap[muscle?.toLowerCase()] || 'text-gray-600 bg-gray-50';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="large">
      <div className="p-6">
        {/* Header Info */}
        {mode === 'swap' && currentExercise && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <p className="text-sm font-medium text-blue-800">
                Replacing: {currentExercise}
              </p>
            </div>
            <p className="text-xs text-blue-600">
              Use the filters below to find a replacement exercise. Exercises already in your plan are excluded.
            </p>
          </div>
        )}

        {mode === 'add' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-sm font-medium text-green-800">
                Add New Exercise
              </p>
            </div>
            <p className="text-xs text-green-600">
              Use the filters below to find an exercise to add. Exercises already in your plan are excluded.
            </p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters for Both Add and Swap Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Muscle Group
              </label>
              <select
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Muscle Groups</option>
                {muscleGroups.map(group => (
                  <option key={group} value={group}>
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Difficulties</option>
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="medium" />
              <span className="ml-2 text-gray-600">Loading exercises...</span>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20a7.962 7.962 0 01-5.207-1.855c-.39-.306-.8-.63-1.207-.982A7.949 7.949 0 014 12a7.962 7.962 0 011.855-5.207c.306-.39.63-.8.982-1.207A7.949 7.949 0 0112 4c1.856 0 3.569.632 4.938 1.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-sm">No exercises found</p>
              <p className="text-xs text-gray-400 mt-1">
                {exercises.length === 0 
                  ? "Try refreshing the page or check your connection"
                  : "Try adjusting your search or filters"
                }
              </p>
              {exercises.length === 0 && (
                <Button variant="primary" size="small" onClick={loadExercises} className="mt-3">
                  Retry Loading
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredExercises.map((exercise) => (
                  <motion.button
                    key={exercise.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => handleSelectExercise(exercise)}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">{getExerciseIcon(exercise.name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {exercise.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                            {exercise.difficulty}
                          </span>
                          {exercise.muscle_group && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMuscleGroupColor(exercise.muscle_group)}`}>
                              {exercise.muscle_group.charAt(0).toUpperCase() + exercise.muscle_group.slice(1)}
                            </span>
                          )}
                        </div>
                        {exercise.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {exercise.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} available
          </p>
          <Button
            variant="ghost"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExerciseSelectionModal;