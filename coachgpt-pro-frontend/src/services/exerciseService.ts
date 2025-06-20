import { apiUtils } from './api';
import { ExerciseResponse, ExerciseFilters, ExerciseDetails } from '../types/exercise';

class ExerciseService {
  async getAllExercises(filters?: ExerciseFilters): Promise<ExerciseResponse> {
    try {
      let url = '/exercises';
      const params = new URLSearchParams();
      
      if (filters?.muscleGroup) {
        params.append('muscleGroup', filters.muscleGroup);
      }
      
      if (filters?.difficulty) {
        params.append('difficulty', filters.difficulty);
      }
      
      if (filters?.search) {
        params.append('search', filters.search);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await apiUtils.get<ExerciseResponse>(url);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch exercises');
    }
  }

  async getExerciseById(id: string): Promise<ExerciseDetails> {
    try {
      const response = await apiUtils.get<ExerciseDetails>(`/exercises/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch exercise details');
    }
  }

  // Search exercises by name or muscle group
  searchExercises(exercises: ExerciseDetails[], searchTerm: string): ExerciseDetails[] {
    if (!searchTerm.trim()) return exercises;
    
    const term = searchTerm.toLowerCase();
    return exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(term) ||
      exercise.muscle_group?.toLowerCase().includes(term) ||
      exercise.description?.toLowerCase().includes(term)
    );
  }

  // Filter exercises by muscle group
  filterByMuscleGroup(exercises: ExerciseDetails[], muscleGroup: string): ExerciseDetails[] {
    if (!muscleGroup) return exercises;
    return exercises.filter(exercise =>
      exercise.muscle_group?.toLowerCase() === muscleGroup.toLowerCase()
    );
  }

  // Filter exercises by difficulty
  filterByDifficulty(exercises: ExerciseDetails[], difficulty: string): ExerciseDetails[] {
    if (!difficulty) return exercises;
    return exercises.filter(exercise => exercise.difficulty === difficulty);
  }

  // Get unique muscle groups from exercises
  getMuscleGroups(exercises: ExerciseDetails[]): string[] {
    const groups: string[] = [];
    
    exercises.forEach(exercise => {
      if (exercise.muscle_group && typeof exercise.muscle_group === 'string') {
        groups.push(exercise.muscle_group.toLowerCase());
      }
    });
    
    return Array.from(new Set(groups)).sort();
  }

  // Get unique difficulty levels from exercises
  getDifficultyLevels(exercises: ExerciseDetails[]): string[] {
    const levels: string[] = [];
    
    exercises.forEach(exercise => {
      if (exercise.difficulty && typeof exercise.difficulty === 'string') {
        levels.push(exercise.difficulty);
      }
    });
    
    return Array.from(new Set(levels)).sort();
  }

  // Helper method to get all available muscle groups (static list)
  getAvailableMuscleGroups(): string[] {
    return [
      'chest',
      'back',
      'shoulders',
      'biceps',
      'triceps',
      'legs',
      'core'
    ];
  }

  // Helper method to get all available difficulty levels (static list)
  getAvailableDifficultyLevels(): string[] {
    return ['beginner', 'intermediate', 'advanced'];
  }

  // Validate exercise data
  validateExercise(exercise: Partial<ExerciseDetails>): string[] {
    const errors: string[] = [];

    if (!exercise.name?.trim()) {
      errors.push('Exercise name is required');
    }

    if (!exercise.muscle_group?.trim()) {
      errors.push('Muscle group is required');
    }

    if (!exercise.difficulty) {
      errors.push('Difficulty level is required');
    } else if (!this.getAvailableDifficultyLevels().includes(exercise.difficulty)) {
      errors.push('Invalid difficulty level');
    }

    return errors;
  }

  // Get exercises by muscle group
  async getExercisesByMuscleGroup(muscleGroup: string): Promise<ExerciseDetails[]> {
    try {
      const filters: ExerciseFilters = { muscleGroup };
      const response = await this.getAllExercises(filters);
      return response.exercises || [];
    } catch (error: any) {
      throw new Error(error.message || `Failed to fetch exercises for ${muscleGroup}`);
    }
  }

  // Get exercises by difficulty
  async getExercisesByDifficulty(difficulty: string): Promise<ExerciseDetails[]> {
    try {
      const filters: ExerciseFilters = { difficulty };
      const response = await this.getAllExercises(filters);
      return response.exercises || [];
    } catch (error: any) {
      throw new Error(error.message || `Failed to fetch ${difficulty} exercises`);
    }
  }

  // Search exercises with multiple filters
  async searchWithFilters(searchTerm: string, filters?: Partial<ExerciseFilters>): Promise<ExerciseDetails[]> {
    try {
      const searchFilters: ExerciseFilters = {
        search: searchTerm,
        ...filters
      };
      const response = await this.getAllExercises(searchFilters);
      return response.exercises || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search exercises');
    }
  }
}

export default new ExerciseService();