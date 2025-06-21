import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutDay as WorkoutDayType, WorkoutPlan } from '../../types/workout';
import { ExerciseDetails } from '../../types/exercise';
import ExerciseCard from './ExerciseCard';
import Button from '../common/Button';
import ExerciseSelectionModal from './ExerciseSelectionModal';
import workoutService from '../../services/workoutService';
import exerciseService from '../../services/exerciseService';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

// Extended Exercise interface that includes all fields needed by ExerciseCard
interface ExtendedExercise {
  id: string;
  name: string;
  muscle_group: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  instructions: string;
  image_url: string;
  video_url: string;
  equipment_required: string[];
  sets: number;
  reps: number | string;
  weight?: number;
  restTime?: number;
  notes?: string;
  completed: boolean;
}

interface WorkoutDayProps {
  day: WorkoutDayType;
  weekNumber: number;
  planId: string;
  allPlanExercises?: string[]; // Make this optional
  onPlanUpdated: (plan: WorkoutPlan) => void;
}

// Cache for exercise database from API
let exerciseDatabase: Record<string, { muscle_group: string; difficulty: string }> = {};

// Wrapper component to handle async conversion
const ExerciseCardWrapper: React.FC<{
  exercise: any;
  day: string;
  weekNumber: number;
  muscleGroups: string[];
  planId: string;
  existingExercises: string[];
  onPlanUpdated: (plan: WorkoutPlan) => void;
}> = ({ exercise, day, weekNumber, muscleGroups, planId, existingExercises, onPlanUpdated }) => {
  const [fullExercise, setFullExercise] = useState<ExtendedExercise | null>(null);

  useEffect(() => {
    const convertExercise = async () => {
      const converted = await convertToExerciseType(exercise, day);
      setFullExercise(converted);
    };
    convertExercise();
  }, [exercise, day]);

  if (!fullExercise) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
        <span className="text-sm text-gray-600">Loading exercise...</span>
      </div>
    );
  }

  return (
    <ExerciseCard
      exercise={fullExercise}
      weekNumber={weekNumber}
      dayName={day}
      muscleGroups={muscleGroups}
      planId={planId}
      existingExercises={existingExercises}
      onPlanUpdated={onPlanUpdated}
    />
  );
};

let isDatabaseLoaded = false;

// Load exercise database from API
const loadExerciseDatabase = async (): Promise<void> => {
  if (isDatabaseLoaded) return;
  
  try {
    const response = await exerciseService.getAllExercises();
    const exercises = response.exercises || [];
    
    // Build the database from API response
    exercises.forEach(exercise => {
      const normalizedName = exercise.name.toLowerCase().trim();
      exerciseDatabase[normalizedName] = {
        muscle_group: exercise.muscle_group,
        difficulty: exercise.difficulty
      };
    });
    
    isDatabaseLoaded = true;
    console.log(`Loaded ${Object.keys(exerciseDatabase).length} exercises from API`);
  } catch (error) {
    console.warn('Failed to load exercise database from API:', error);
    // Continue with fallback inference
  }
};

// Type conversion function to convert workout exercise to full Exercise type
const convertToExerciseType = async (workoutExercise: any, dayName: string): Promise<ExtendedExercise> => {
  // Ensure database is loaded
  await loadExerciseDatabase();
  
  // Generate a unique ID if not present
  const id = workoutExercise.id || `${workoutExercise.name?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  
  // Get accurate muscle group and difficulty from database
  const getExerciseInfo = (exerciseName: string) => {
    const normalizedName = exerciseName.toLowerCase().trim();
    const exerciseInfo = exerciseDatabase[normalizedName];
    
    if (exerciseInfo) {
      return exerciseInfo;
    }
    
    // Fallback inference if not in database
    return inferFromName(exerciseName, dayName);
  };

  // Fallback inference function
  const inferFromName = (exerciseName: string, day: string) => {
    const exerciseLower = exerciseName.toLowerCase();
    
    // Muscle group inference
    let muscle_group = 'core'; // default
    if (exerciseLower.includes('push') || exerciseLower.includes('bench') || exerciseLower.includes('chest')) muscle_group = 'chest';
    else if (exerciseLower.includes('pull') || exerciseLower.includes('row') || exerciseLower.includes('lat')) muscle_group = 'back';
    else if (exerciseLower.includes('press') || exerciseLower.includes('shoulder') || exerciseLower.includes('lateral')) muscle_group = 'shoulders';
    else if (exerciseLower.includes('curl') || exerciseLower.includes('bicep')) muscle_group = 'biceps';
    else if (exerciseLower.includes('tricep') || exerciseLower.includes('dip') || exerciseLower.includes('extension')) muscle_group = 'triceps';
    else if (exerciseLower.includes('squat') || exerciseLower.includes('lunge') || exerciseLower.includes('leg')) muscle_group = 'legs';
    else if (exerciseLower.includes('plank') || exerciseLower.includes('crunch') || exerciseLower.includes('ab')) muscle_group = 'core';
    
    // Difficulty inference
    let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (exerciseLower.includes('weighted') || exerciseLower.includes('barbell') || exerciseLower.includes('advanced')) difficulty = 'advanced';
    else if (exerciseLower.includes('dumbbell') || exerciseLower.includes('cable') || exerciseLower.includes('machine')) difficulty = 'intermediate';
    
    return { muscle_group, difficulty };
  };

  const exerciseInfo = getExerciseInfo(workoutExercise.name || '');
  
  // Return an exercise with all the fields expected by ExerciseCard
  return {
    id,
    name: workoutExercise.name || 'Unknown Exercise',
    muscle_group: exerciseInfo.muscle_group,
    difficulty: exerciseInfo.difficulty as 'beginner' | 'intermediate' | 'advanced',
    description: workoutExercise.description || '',
    instructions: workoutExercise.instructions || '',
    image_url: workoutExercise.image_url || '',
    video_url: workoutExercise.video_url || '',
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
  allPlanExercises = [],
  onPlanUpdated 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Extract muscle groups from exercises (not day name)
  const getMuscleGroups = useCallback(async (exercises: any[]): Promise<string[]> => {
    if (!exercises || exercises.length === 0) return ['core'];
    
    const muscleGroups = new Set<string>();
    
    // Process exercises and get their muscle groups
    for (const exercise of exercises) {
      const exerciseInfo = await convertToExerciseType(exercise, day.day);
      muscleGroups.add(exerciseInfo.muscle_group);
    }
    
    return Array.from(muscleGroups);
  }, [day.day]);

  // Get all exercise names in the current day
  const getExistingExercises = useCallback((): string[] => {
    if (!day.exercises || day.exercises.length === 0) return [];
    return day.exercises.map(exercise => exercise.name || '').filter(name => name.trim() !== '');
  }, [day.exercises]);

  // Get the most common difficulty level from existing exercises
  const getPrimaryDifficulty = useCallback(async (): Promise<string> => {
    if (!day.exercises || day.exercises.length === 0) return 'beginner';
    
    const difficulties: string[] = [];
    
    // Get difficulties from all exercises
    for (const exercise of day.exercises) {
      const exerciseInfo = await convertToExerciseType(exercise, day.day);
      if (exerciseInfo.difficulty) {
        difficulties.push(exerciseInfo.difficulty);
      }
    }
    
    if (difficulties.length === 0) return 'beginner';
    
    // Count occurrences and return the most common
    const counts = difficulties.reduce((acc, diff) => {
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
  }, [day.exercises, day.day]);

  // Use state for muscle groups and difficulty since they're async
  const [muscleGroups, setMuscleGroups] = useState<string[]>(['core']);
  const [primaryDifficulty, setPrimaryDifficulty] = useState<string>('beginner');
  const primaryMuscleGroup = muscleGroups[0] || 'core';

  // Load muscle groups and difficulty when exercises change
  useEffect(() => {
    const loadWorkoutData = async () => {
      const groups = await getMuscleGroups(day.exercises || []);
      const difficulty = await getPrimaryDifficulty();
      setMuscleGroups(groups);
      setPrimaryDifficulty(difficulty);
    };
    loadWorkoutData();
  }, [day.exercises, getMuscleGroups, getPrimaryDifficulty]);

  // Updated muscle group emojis
  const getMuscleGroupEmoji = useCallback((muscle: string): string => {
    const emojiMap: Record<string, string> = {
      chest: '💪',      // Flexed bicep for chest
      back: '🔙',       // Back arrow for back
      shoulders: '🏋️‍♂️',   // Weight lifter for shoulders
      biceps: '💪',     // Flexed bicep for biceps
      triceps: '🔱',    // Trident for triceps
      legs: '🦵',       // Leg for legs
      core: '🟡',       // Yellow circle for core
      general: '⚡',    // Lightning for general
    };
    return emojiMap[muscle] || '⚡';
  }, []);

  // Get muscle group display name
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

  // Handle adding exercise - open modal
  const handleAddExercise = useCallback(async () => {
    setShowAddModal(true);
  }, []);

  // Handle add exercise confirmation - FIXED to match backend
  const handleAddConfirm = useCallback(async (selectedExercise: ExerciseDetails) => {
    if (!planId) {
      toast.error('Plan ID is required to add exercise');
      return;
    }

    try {
      setIsAddingExercise(true);

      // Backend expects: { weekNumber, muscleGroup, newExercise }
      const addRequest = {
        weekNumber: weekNumber,
        muscleGroup: selectedExercise.muscle_group || primaryMuscleGroup,
        newExercise: selectedExercise.name
      };

      console.log('➕ Add request (matches backend):', addRequest);

      const response = await workoutService.addExercise(planId, addRequest);

      toast.success(response.message || 'Exercise added successfully');
      onPlanUpdated(response.updatedPlan);
      setShowAddModal(false);
    } catch (error: any) {
      console.error('🚨 Add failed:', error);
      const errorMessage = error.message || 'Failed to add exercise';
      toast.error(errorMessage);
    } finally {
      setIsAddingExercise(false);
    }
  }, [planId, weekNumber, primaryMuscleGroup, onPlanUpdated]);

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
  const estimatedDuration = Math.max(45, totalExercises * 12); // More realistic: 12 minutes per exercise, minimum 45 minutes

  return (
    <>
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
                <span>~{Math.round(estimatedDuration)} min</span>
                {muscleGroups.length > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-blue-600 font-medium">
                      {muscleGroups.map(group => getMuscleGroupDisplayName(group)).join(', ')}
                    </span>
                  </>
                )}
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
                      return (
                        <ExerciseCardWrapper
                          key={`${exercise.name || 'exercise'}-${exerciseIndex}`}
                          exercise={exercise}
                          day={day.day}
                          weekNumber={weekNumber}
                          muscleGroups={muscleGroups}
                          planId={planId}
                          existingExercises={allPlanExercises}
                          onPlanUpdated={onPlanUpdated}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
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
                        <p className="text-sm font-medium text-blue-800">
                          Focus: {muscleGroups.map(group => getMuscleGroupDisplayName(group)).join(', ')}
                        </p>
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

      {/* Add Exercise Modal */}
      <ExerciseSelectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelect={handleAddConfirm}
        title="Add Exercise"
        muscleGroup={primaryMuscleGroup}
        difficulty={primaryDifficulty}
        existingExercises={allPlanExercises}
        mode="add"
      />
    </>
  );
};

export default WorkoutDay;