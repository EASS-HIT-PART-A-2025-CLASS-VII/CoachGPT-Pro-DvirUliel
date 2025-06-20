import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Exercise } from '../../types/exercise';
import { WorkoutPlan } from '../../types/workout';
import workoutService from '../../services/workoutService';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';

interface ExerciseCardProps {
  exercise: Exercise;
  weekNumber: number;
  dayName: string;
  muscleGroups: string[];
  planId: string;
  onPlanUpdated: (plan: WorkoutPlan) => void;
}

// Exercise icons mapping
const EXERCISE_ICONS: Record<string, string> = {
  squat: '🦵',
  lunge: '🦵',
  push: '💪',
  press: '💪',
  chest: '💪',
  pull: '🔝',
  row: '🔝',
  lat: '🔝',
  curl: '💪',
  extension: '💪',
  deadlift: '🏋️',
  plank: '🏃',
  crunch: '🏃',
  abs: '🏃',
  cardio: '❤️',
  run: '❤️',
  bike: '❤️',
  default: '⚡'
};

// SVG Icons as components
const IconSet = ({ sets }: { sets: React.ReactNode }) => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
);

const IconReps = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const IconTime = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconSwap = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const IconDelete = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  weekNumber,
  dayName,
  muscleGroups,
  planId,
  onPlanUpdated,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Get exercise icon based on name
  const getExerciseIcon = useCallback((exerciseName: string): string => {
    const name = exerciseName.toLowerCase();
    const matchedKey = Object.keys(EXERCISE_ICONS).find(key => name.includes(key));
    return EXERCISE_ICONS[matchedKey || 'default'];
  }, []);

  // Format reps display
  const formatReps = useCallback((reps: number | string): string => {
    if (typeof reps === 'string') return reps;
    return `${reps} reps`;
  }, []);

  // Handle exercise swap
  const handleSwapExercise = useCallback(async () => {
    setShowSwapModal(true);
    // TODO: Implement exercise swap functionality
    // This would typically open a modal with alternative exercises
    console.log('Swap exercise:', { 
      exercise: exercise.name, 
      week: weekNumber, 
      day: dayName,
      muscleGroups 
    });
    toast('Exercise swap modal coming soon!', {
      icon: 'ℹ️',
      duration: 3000,
    });
  }, [exercise.name, weekNumber, dayName, muscleGroups]);

  // Handle exercise deletion
  const handleDeleteExercise = useCallback(async () => {
    if (!planId) {
      toast.error('Plan ID is required to delete exercise');
      return;
    }

    const primaryMuscleGroup = muscleGroups[0] || 'general';

    try {
      setIsDeleting(true);
      const response = await workoutService.deleteExercise(planId, {
        weekNumber,
        muscleGroup: primaryMuscleGroup,
        exerciseToDelete: exercise.name,
      });

      toast.success(response.message || 'Exercise removed successfully');
      onPlanUpdated(response.updatedPlan);
      setShowDeleteModal(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete exercise';
      toast.error(errorMessage);
      console.error('Delete exercise error:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [planId, weekNumber, muscleGroups, exercise.name, onPlanUpdated]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50"
        role="article"
        aria-label={`Exercise: ${exercise.name}`}
      >
        <div className="flex items-center justify-between">
          {/* Exercise Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg" role="img" aria-label="Exercise type">
                {getExerciseIcon(exercise.name)}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h5 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                {exercise.name}
              </h5>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                <span className="flex items-center whitespace-nowrap">
                  <IconSet sets={undefined} />
                  <span className="sr-only">Sets: </span>
                  {exercise.sets} sets
                </span>
                <span className="flex items-center whitespace-nowrap">
                  <IconReps />
                  <span className="sr-only">Repetitions: </span>
                  {formatReps(exercise.reps)}
                </span>
                {exercise.restTime && (
                  <span className="flex items-center whitespace-nowrap">
                    <IconTime />
                    <span className="sr-only">Rest time: </span>
                    {exercise.restTime}s rest
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
            <button
              onClick={handleSwapExercise}
              onKeyDown={(e) => handleKeyDown(e, handleSwapExercise)}
              disabled={isSwapping}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Swap Exercise"
              aria-label={`Swap ${exercise.name} exercise`}
            >
              {isSwapping ? (
                <LoadingSpinner size="small" />
              ) : (
                <IconSwap />
              )}
            </button>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              onKeyDown={(e) => handleKeyDown(e, () => setShowDeleteModal(true))}
              disabled={isDeleting}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Remove Exercise"
              aria-label={`Remove ${exercise.name} exercise`}
            >
              {isDeleting ? (
                <LoadingSpinner size="small" />
              ) : (
                <IconDelete />
              )}
            </button>
          </div>
        </div>

        {/* Exercise Details */}
        <div className="mt-3 space-y-2">
          {/* Exercise Notes */}
          {exercise.notes && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600 italic leading-5">{exercise.notes}</p>
            </div>
          )}

          {/* Weight/Progress Tracking */}
          {exercise.weight && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Weight:</span>
                <span className="text-sm font-medium text-gray-900">{exercise.weight} lbs</span>
              </div>
            </div>
          )}

          {/* Additional exercise properties */}
          {exercise.difficulty && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Difficulty:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {exercise.difficulty}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove Exercise"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to remove <strong>"{exercise.name}"</strong> from your {dayName} workout?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteExercise}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isDeleting && <LoadingSpinner size="small" />}
              <span>{isDeleting ? 'Removing...' : 'Remove Exercise'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Swap Exercise Modal - Placeholder */}
      <Modal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        title="Swap Exercise"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Exercise swap functionality will be implemented here. You can replace <strong>"{exercise.name}"</strong> 
            with similar exercises targeting the same muscle groups.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setShowSwapModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExerciseCard;