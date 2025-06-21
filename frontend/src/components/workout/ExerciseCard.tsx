import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Exercise } from '../../types/exercise';
import { WorkoutPlan } from '../../types/workout';
import { ExerciseDetails } from '../../types/exercise';
import workoutService from '../../services/workoutService';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import ExerciseSelectionModal from './ExerciseSelectionModal';

interface ExerciseCardProps {
  exercise: Exercise;
  weekNumber: number;
  dayName: string;
  muscleGroups: string[];
  planId: string;
  existingExercises?: string[]; // List of exercises already in the plan
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
  existingExercises = [],
  onPlanUpdated,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Helper function to get muscle group display name
  const getMuscleGroupDisplayName = useCallback((muscle: string): string => {
    const displayNames: Record<string, string> = {
      chest: 'Chest',
      back: 'Back',
      shoulders: 'Shoulders',
      biceps: 'Biceps',
      triceps: 'Triceps',
      legs: 'Legs',
      core: 'Core',
      general: 'General',
    };
    return displayNames[muscle] || muscle.charAt(0).toUpperCase() + muscle.slice(1);
  }, []);

  // Helper function to get muscle group color
  const getMuscleGroupColor = useCallback((muscle: string): string => {
    const colorMap: Record<string, string> = {
      chest: 'text-red-600 bg-red-50',
      back: 'text-green-600 bg-green-50',
      shoulders: 'text-yellow-600 bg-yellow-50',
      biceps: 'text-blue-600 bg-blue-50',
      triceps: 'text-purple-600 bg-purple-50',
      legs: 'text-orange-600 bg-orange-50',
      core: 'text-indigo-600 bg-indigo-50',
      general: 'text-gray-600 bg-gray-50',
    };
    return colorMap[muscle] || 'text-gray-600 bg-gray-50';
  }, []);

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

  // Helper to determine muscle group for backend
  const determineMuscleGroup = useCallback((): string => {
    // Priority order: exercise.muscle_group -> muscleGroups array -> infer from day name
    if (exercise.muscle_group) {
      return exercise.muscle_group;
    }
    
    if (muscleGroups && muscleGroups.length > 0) {
      return muscleGroups[0];
    }
    
    // Infer from day name as last resort
    const dayLower = dayName.toLowerCase();
    if (dayLower.includes('chest')) return 'chest';
    if (dayLower.includes('back')) return 'back';
    if (dayLower.includes('shoulder')) return 'shoulders';
    if (dayLower.includes('bicep')) return 'biceps';
    if (dayLower.includes('tricep')) return 'triceps';
    if (dayLower.includes('leg')) return 'legs';
    if (dayLower.includes('core') || dayLower.includes('abs')) return 'core';
    
    return 'general'; // fallback
  }, [exercise.muscle_group, muscleGroups, dayName]);

  // Handle exercise swap - open modal
  const handleSwapExercise = useCallback(async () => {
    setShowSwapModal(true);
  }, []);

  // Handle exercise swap confirmation - FIXED with proper state management
  const handleSwapConfirm = useCallback(async (selectedExercise: ExerciseDetails) => {
    if (!planId) {
      toast.error('Plan ID is required to swap exercise');
      return;
    }
  
    try {
      setIsSwapping(true);
  
      console.log('🔄 SWAP OPERATION STARTING - FULL DEBUG');
      console.log('📋 Current exercise from props:', exercise.name);
      console.log('🆕 New exercise selected:', selectedExercise.name);
      console.log('📅 Week number:', weekNumber);
      console.log('🆔 Plan ID:', planId);
      console.log('🏠 Day name:', dayName);
      console.log('💪 Muscle groups:', muscleGroups);
  
      // CRITICAL: Let's fetch the current plan state to see what exercises actually exist
      console.log('🔍 FETCHING CURRENT PLAN STATE FROM BACKEND...');
      let currentPlan;
      try {
        const planResponse = await workoutService.getPlanById(planId);
        currentPlan = planResponse.plan;
        console.log('📋 Current plan from backend:', currentPlan);
        
        // Find the specific week and day
        const targetWeek = currentPlan.plan_data?.weeks?.find(w => w.week === weekNumber);
        console.log(`📅 Week ${weekNumber} data:`, targetWeek);
        
        if (targetWeek) {
          console.log('📋 All exercises in week:');
          targetWeek.days.forEach((day, dayIndex) => {
            console.log(`  Day ${dayIndex + 1} (${day.day}):`, day.exercises?.map(ex => ex.name || ex));
          });
          
          // Check if current exercise actually exists
          const exerciseExists = targetWeek.days.some(day => 
            day.exercises?.some(ex => 
              (typeof ex === 'string' ? ex : ex.name) === exercise.name
            )
          );
          
          console.log(`🔍 Does "${exercise.name}" exist in current plan?`, exerciseExists);
          
          if (!exerciseExists) {
            console.error(`❌ PROBLEM FOUND: "${exercise.name}" does not exist in the current plan!`);
            console.log('🔍 Available exercises in the plan:');
            targetWeek.days.forEach(day => {
              day.exercises?.forEach(ex => {
                const exerciseName = typeof ex === 'string' ? ex : ex.name;
                console.log(`  - "${exerciseName}"`);
              });
            });
            
            toast.error(`Exercise "${exercise.name}" no longer exists in your plan. Please refresh the page.`);
            return;
          }
        }
        
      } catch (planFetchError) {
        console.error('❌ Failed to fetch current plan:', planFetchError);
        toast.error('Failed to verify current plan state. Please refresh the page.');
        return;
      }
  
      // If we get here, the exercise exists - proceed with swap
      const swapRequest = {
        currentExercise: exercise.name,
        newExercise: selectedExercise.name,
        weekNumber: weekNumber
      };
  
      console.log('📤 Sending swap request:', swapRequest);
  
      const response = await workoutService.swapExercise(planId, swapRequest);
  
      console.log('✅ Swap successful, response:', response);
  
      // Update the plan state immediately
      if (response.updatedPlan) {
        console.log('🔄 Updating plan state with:', response.updatedPlan);
        onPlanUpdated(response.updatedPlan);
      } else {
        console.warn('⚠️ No updated plan in response, fetching fresh plan...');
        const freshPlan = await workoutService.getPlanById(planId);
        onPlanUpdated(freshPlan.plan);
      }
  
      toast.success(response.message || 'Exercise swapped successfully');
      setShowSwapModal(false);
      
      console.log('✅ Swap operation completed successfully');
    } catch (error: any) {
      console.error('🚨 Swap failed:', error);
      
      let errorMessage = 'Failed to swap exercise';
      
      if (error.message.includes('not found')) {
        errorMessage = 'Exercise or workout plan not found - please refresh the page';
      } else if (error.message.includes('already exists')) {
        errorMessage = 'This exercise is already in your workout';
      } else if (error.message.includes('muscle group')) {
        errorMessage = 'No suitable workout day found for this muscle group';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSwapping(false);
    }
  }, [planId, weekNumber, exercise.name, onPlanUpdated, dayName, muscleGroups]);
  // Handle exercise deletion - FIXED with proper state management
  const handleDeleteExercise = useCallback(async () => {
    if (!planId) {
      toast.error('Plan ID is required to delete exercise');
      return;
    }

    try {
      setIsDeleting(true);

      const muscleGroup = determineMuscleGroup();

      console.log('🗑️ DELETE OPERATION STARTING');
      console.log('📋 Exercise to delete:', exercise.name);
      console.log('💪 Muscle group:', muscleGroup);
      console.log('📅 Week number:', weekNumber);
      console.log('🆔 Plan ID:', planId);

      // Backend expects: { weekNumber, muscleGroup, exerciseToDelete }
      const deleteRequest = {
        weekNumber: weekNumber,
        muscleGroup: muscleGroup,
        exerciseToDelete: exercise.name
      };

      console.log('📤 Sending delete request:', deleteRequest);

      const response = await workoutService.deleteExercise(planId, deleteRequest);

      console.log('✅ Delete successful, response:', response);

      // CRITICAL: Update the plan state immediately
      if (response.updatedPlan) {
        console.log('🔄 Updating plan state with:', response.updatedPlan);
        onPlanUpdated(response.updatedPlan);
      } else {
        console.warn('⚠️ No updated plan in response, fetching fresh plan...');
        // Fallback: fetch fresh plan if no updated plan in response
        const freshPlan = await workoutService.getPlanById(planId);
        onPlanUpdated(freshPlan.plan);
      }

      toast.success(response.message || 'Exercise removed successfully');
      setShowDeleteModal(false);
      
      console.log('✅ Delete operation completed successfully');
    } catch (error: any) {
      console.error('🚨 Delete failed:', error);
      const errorMessage = error.message || 'Failed to delete exercise';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [planId, weekNumber, exercise.name, determineMuscleGroup, onPlanUpdated]);

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

          {/* Difficulty and Muscle Group */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            {/* Difficulty Level */}
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
            
            {/* Muscle Group */}
            {(exercise.muscle_group || muscleGroups.length > 0) && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Muscle Group:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMuscleGroupColor(exercise.muscle_group || muscleGroups[0])}`}>
                  {getMuscleGroupDisplayName(exercise.muscle_group || muscleGroups[0])}
                </span>
              </div>
            )}
          </div>
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

      {/* Exercise Swap Modal */}
      <ExerciseSelectionModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        onSelect={handleSwapConfirm}
        title="Swap Exercise"
        muscleGroup={exercise.muscle_group}
        difficulty={exercise.difficulty}
        currentExercise={exercise.name}
        existingExercises={existingExercises}
        mode="swap"
      />
    </>
  );
};

export default ExerciseCard;