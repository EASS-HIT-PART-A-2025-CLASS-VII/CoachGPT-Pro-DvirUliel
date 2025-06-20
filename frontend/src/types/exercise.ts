export interface ExerciseDetails {
    id: string;
    name: string;
    muscle_group: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    description?: string;
    instructions?: string;
    image_url?: string;
    video_url?: string;
    equipment_required?: string[];
  }
  
  export interface ExerciseResponse {
    status: string;
    count: number;
    exercises: ExerciseDetails[];
  }
  
  export interface ExerciseFilters {
    muscleGroup?: string;
    difficulty?: string;
    search?: string;
  }
  
  // Exercise type for workout plans (extends ExerciseDetails with workout-specific properties)
  export interface Exercise extends ExerciseDetails {
    sets: number;
    reps: number | string;
    weight?: number;
    restTime?: number;
    notes?: string;
    completed?: boolean;
  }
  
  // For exercise swapping/replacement
  export interface ExerciseSwapRequest {
    currentExerciseId: string;
    targetMuscleGroup: string;
    difficulty?: string;
    equipment?: string[];
  }
  
  export interface ExerciseSwapResponse {
    status: string;
    alternatives: ExerciseDetails[];
  }