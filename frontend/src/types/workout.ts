export interface Exercise {
    name: string;
    sets: number;
    reps: number | string;
    restTime?: number;
    weight?: number;
    notes?: string;
  }
  
  export interface WorkoutDay {
    day: string;
    exercises: Exercise[];
  }
  
  export interface WorkoutWeek {
    week: number;
    days: WorkoutDay[];
  }
  
  export interface WorkoutPlan {
    id: string;
    user_id: string;
    goal: string;
    days_per_week: number;
    plan_data: {
      weeks: WorkoutWeek[];
    };
    created_at: string;
    updated_at: string;
  }
  
  export interface PlanGenerationRequest {
    userId: string;
    goal: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general_fitness';
    daysPerWeek: number;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  }
  
  export interface ExerciseSwapRequest {
    currentExercise: string;
    newExercise: string;
    weekNumber: number;
  }
  
  export interface AddExerciseRequest {
    weekNumber: number;
    muscleGroup: string;
    newExercise: string;
  }
  
  export interface DeleteExerciseRequest {
    weekNumber: number;
    muscleGroup: string;
    exerciseToDelete: string;
  }
  
  export interface PlanAction {
    id: string;
    plan_id: string;
    action_type: 'swap' | 'add' | 'delete' | 'generate';
    old_exercise?: string;
    new_exercise?: string;
    week_number?: number;
    day_name?: string;
    created_at: string;
  }