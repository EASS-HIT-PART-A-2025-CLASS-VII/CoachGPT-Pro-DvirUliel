import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutDay as WorkoutDayType, WorkoutPlan } from '../../types/workout';
import { Exercise } from '../../types/exercise';
import ExerciseCard from './ExerciseCard';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface WorkoutDayProps {
  day: WorkoutDayType;
  weekNumber: number;
  planId: string;
  onPlanUpdated: (plan: WorkoutPlan) => void;
}

// Type conversion function to convert workout exercise to full Exercise type
const convertToExerciseType = (workoutExercise: any, dayName: string): Exercise => {
  // Generate a unique ID if not present
  const id = workoutExercise.id || `${workoutExercise.name?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  
  // Infer muscle group from day name or exercise name
  const inferMuscleGroup = (day: string, exerciseName: string): string => {
    const dayLower = day.toLowerCase();
    const exerciseLower = exerciseName.toLowerCase();
    
    if (dayLower.includes('chest') || exerciseLower.includes('chest') || exerciseLower.includes('push')) return 'chest';
    if (dayLower.includes('back') || exerciseLower.includes('back') || exerciseLower.includes('pull') || exerciseLower.includes('row')) return 'back';
    if (dayLower.includes('shoulder') || exerciseLower.includes('shoulder') || exerciseLower.includes('press')) return 'shoulders';
    if (dayLower.includes('arm') || exerciseLower.includes('bicep') || exerciseLower.includes('tricep') || exerciseLower.includes('curl')) return 'arms';
    if (dayLower.includes('leg') || exerciseLower.includes('squat') || exerciseLower.includes('lunge') || exerciseLower.includes('leg')) return 'legs';
    if (dayLower.includes('core') || dayLower.includes('ab') || exerciseLower.includes('plank') || exerciseLower.includes('crunch')) return 'core';
    if (exerciseLower.includes('cardio') || exerciseLower.includes('run') || exerciseLower.includes('bike')) return 'cardio';
    return 'general';
  };

  // Infer difficulty based on sets and reps
  const inferDifficulty = (sets: number, reps: number | string): 'beginner' | 'intermediate' | 'advanced' => {
    const totalVolume = sets * (typeof reps === 'number' ? reps : 10); // Default to 10 if string
    if (totalVolume <= 30) return 'beginner';
    if (totalVolume <= 60) return 'intermediate';
    return 'advanced';
  };

  const muscle_group = workoutExercise.muscle_group || inferMuscleGroup(dayName, workoutExercise.name || '');
  const difficulty = workoutExercise.difficulty || inferDifficulty(workoutExercise.sets || 3, workoutExercise.reps || 10);

  return {
    id,
    name: workoutExercise.name || 'Unknown Exercise',
    muscle_group,
    difficulty,
    description: workoutExercise.description,
    instructions: workoutExercise.instructions,
    image_url: workoutExercise.image_url,
    video_url: workoutExercise.video_url,
    equipment_required: workoutExercise.equipment_required || [],
    sets: workoutExercise.sets || 3,
    reps: workoutExercise.reps || 10,
    weight: workoutExercise.weight,
    restTime: workoutExercise.restTime,
    notes: workoutExercise.notes,
    completed: workoutExercise.completed || false,
  };
};

const WorkoutDay: React.FC<WorkoutDayProps> = ({ 
  day, 
  weekNumber, 
  planId, 
  onPlanUpdated 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);

  // Extract muscle groups from day name
  const getMuscleGroups = useCallback((dayName: string): string[] => {
    const muscleGroups: string[] = [];
    const dayLower = dayName.toLowerCase();
    
    if (dayLower.includes('chest')) muscleGroups.push('chest');
    if (dayLower.includes('back')) muscleGroups.push('back');
    if (dayLower.includes('shoulder')) muscleGroups.push('shoulders');
    if (dayLower.includes('arm') || dayLower.includes('bicep') || dayLower.includes('tricep')) muscleGroups.push('arms');
    if (dayLower.includes('leg')) muscleGroups.push('legs');
    if (dayLower.includes('core') || dayLower.includes('ab')) muscleGroups.push('core');
    if (dayLower.includes('cardio')) muscleGroups.push('cardio');
    
    return muscleGroups.length > 0 ? muscleGroups : ['general'];
  }, []);

  const muscleGroups = getMuscleGroups(day.day);
  const primaryMuscleGroup = muscleGroups[0] || 'general';

  // Get muscle group emoji
  const getMuscleGroupEmoji = useCallback((muscle: string): string => {
    const emojiMap: Record<string, string> = {
      chest: '💪',
      back: '🔝',
      shoulders: '🏋️',
      arms: '💪',
      legs: '🦵',
      core: '🏃',
      cardio: '❤️',
      general: '⚡',
    };
    return emojiMap[muscle] || '⚡';
  }, []);

  // Handle adding exercise
  const handleAddExercise = useCallback(async () => {
    setIsAddingExercise(true);
    try {
      // TODO: Implement add exercise functionality
      // This would typically open a modal with exercise selection
      console.log('Add exercise to:', { 
        day: day.day, 
        week: weekNumber, 
        muscleGroups,
        planId 
      });
      
      toast('Add exercise functionality coming soon!', {
        icon: '➕',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error adding exercise:', error);
      toast.error('Failed to add exercise');
    } finally {
      setIsAddingExercise(false);
    }
  }, [day.day, weekNumber, muscleGroups, planId]);

  // Toggle expand/collapse with keyboard support
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded();
    }
  }, [toggleExpanded]);

  // Calculate workout summary
  const totalExercises = day.exercises?.length || 0;
  const estimatedDuration = totalExercises * 3; // Rough estimate: 3 minutes per exercise

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Day Header */}
      <button
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-expanded={isExpanded}
        aria-label={`${day.day} workout, ${totalExercises} exercises`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-lg" role="img" aria-label={`${primaryMuscleGroup} workout`}>
              {getMuscleGroupEmoji(primaryMuscleGroup)}
            </span>
          </div>
          <div className="text-left min-w-0 flex-1">
            <h4 className="font-semibold text-gray-900 truncate">{day.day}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{totalExercises} exercise{totalExercises !== 1 ? 's' : ''}</span>
              <span className="text-gray-400">•</span>
              <span>~{estimatedDuration} min</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Exercise count badge */}
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
            {totalExercises}
          </span>
          
          {/* Expand/Collapse Icon */}
          <motion.svg
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </button>

      {/* Day Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-gray-200 bg-gray-50"
          >
            <div className="p-4">
              {/* Exercise List */}
              {day.exercises && day.exercises.length > 0 ? (
                <div className="space-y-3">
                  {day.exercises.map((exercise, exerciseIndex) => {
                    // Convert the workout exercise to the full Exercise type
                    const fullExercise = convertToExerciseType(exercise, day.day);
                    
                    return (
                      <ExerciseCard
                        key={`${fullExercise.id}-${exerciseIndex}`}
                        exercise={fullExercise}
                        weekNumber={weekNumber}
                        dayName={day.day}
                        muscleGroups={muscleGroups}
                        planId={planId}
                        onPlanUpdated={onPlanUpdated}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-sm">No exercises yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add your first exercise below</p>
                </div>
              )}

              {/* Add Exercise Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleAddExercise}
                  disabled={isAddingExercise}
                  className="w-full justify-center"
                  aria-label={`Add exercise to ${day.day} workout`}
                >
                  {isAddingExercise ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Exercise
                    </>
                  )}
                </Button>
              </div>

              {/* Workout Notes or Tips */}
              {muscleGroups.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Focus: {muscleGroups.join(', ')}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Remember to maintain proper form and rest adequately between sets.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WorkoutDay;