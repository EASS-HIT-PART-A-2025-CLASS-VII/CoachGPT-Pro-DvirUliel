import { apiUtils } from './api';
import {
  WorkoutPlan,
  PlanGenerationRequest,
  ExerciseSwapRequest,
  AddExerciseRequest,
  DeleteExerciseRequest,
  PlanAction,
} from '../types/workout';

class WorkoutService {
  async generatePlan(request: PlanGenerationRequest): Promise<{ plan: WorkoutPlan }> {
    try {
      const response = await apiUtils.post<{ status: string; plan: WorkoutPlan }>('/plan/generate', request);
      return { plan: response.plan };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate workout plan');
    }
  }

  async getUserPlan(userId: string): Promise<WorkoutPlan> {
    try {
      const response = await apiUtils.get<WorkoutPlan>(`/plan/user/${userId}`);
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('No workout plan found. Create your first plan to get started!');
      }
      throw new Error(error.message || 'Failed to fetch workout plan');
    }
  }

  async getPlanById(planId: string): Promise<{ plan: WorkoutPlan }> {
    try {
      const response = await apiUtils.get<{ status: string; plan: WorkoutPlan }>(`/plan/${planId}`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch workout plan');
    }
  }

  async swapExercise(planId: string, request: ExerciseSwapRequest): Promise<{ message: string; updatedPlan: WorkoutPlan }> {
    try {
      const response = await apiUtils.patch<{ status: string; message: string; updatedPlan: WorkoutPlan }>(
        `/plan/${planId}/swap-exercise`,
        request
      );
      return {
        message: response.message,
        updatedPlan: response.updatedPlan,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to swap exercise');
    }
  }

  async addExercise(planId: string, request: AddExerciseRequest): Promise<{ message: string; updatedPlan: WorkoutPlan }> {
    try {
      const response = await apiUtils.patch<{ status: string; message: string; updatedPlan: WorkoutPlan }>(
        `/plan/${planId}/add-exercise`,
        request
      );
      return {
        message: response.message,
        updatedPlan: response.updatedPlan,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add exercise');
    }
  }

  async deleteExercise(planId: string, request: DeleteExerciseRequest): Promise<{ message: string; updatedPlan: WorkoutPlan }> {
    try {
      const response = await apiUtils.patch<{ status: string; message: string; updatedPlan: WorkoutPlan }>(
        `/plan/${planId}/delete-exercise`,
        request
      );
      return {
        message: response.message,
        updatedPlan: response.updatedPlan,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete exercise');
    }
  }

  async deletePlan(planId: string): Promise<{ message: string }> {
    try {
      const response = await apiUtils.delete<{ status: string; message: string }>(`/plan/${planId}/delete-plan`);
      return { message: response.message };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete workout plan');
    }
  }

  async getPlanActions(planId: string): Promise<{ actions: PlanAction[] }> {
    try {
      const response = await apiUtils.get<{ status: string; actions: PlanAction[] }>(`/plan/${planId}/actions`);
      return { actions: response.actions };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch plan actions');
    }
  }

  // Helper method to validate plan generation request
  validatePlanRequest(request: Partial<PlanGenerationRequest>): string[] {
    const errors: string[] = [];

    if (!request.userId) {
      errors.push('User ID is required');
    }

    if (!request.goal) {
      errors.push('Fitness goal is required');
    }

    if (!request.daysPerWeek || request.daysPerWeek < 1 || request.daysPerWeek > 7) {
      errors.push('Days per week must be between 1 and 7');
    }

    if (!request.difficultyLevel) {
      errors.push('Difficulty level is required');
    }

    return errors;
  }

  // Helper method to validate exercise swap request
  validateSwapRequest(request: Partial<ExerciseSwapRequest>): string[] {
    const errors: string[] = [];

    if (!request.currentExercise?.trim()) {
      errors.push('Current exercise name is required');
    }

    if (!request.newExercise?.trim()) {
      errors.push('New exercise name is required');
    }

    if (!request.weekNumber || request.weekNumber < 1 || request.weekNumber > 4) {
      errors.push('Week number must be between 1 and 4');
    }

    if (request.currentExercise?.toLowerCase() === request.newExercise?.toLowerCase()) {
      errors.push('New exercise must be different from current exercise');
    }

    return errors;
  }

  // Helper method to validate add exercise request
  validateAddRequest(request: Partial<AddExerciseRequest>): string[] {
    const errors: string[] = [];

    if (!request.weekNumber || request.weekNumber < 1 || request.weekNumber > 4) {
      errors.push('Week number must be between 1 and 4');
    }

    if (!request.muscleGroup?.trim()) {
      errors.push('Muscle group is required');
    }

    if (!request.newExercise?.trim()) {
      errors.push('Exercise name is required');
    }

    return errors;
  }

  // Helper method to validate delete exercise request
  validateDeleteRequest(request: Partial<DeleteExerciseRequest>): string[] {
    const errors: string[] = [];

    if (!request.weekNumber || request.weekNumber < 1 || request.weekNumber > 4) {
      errors.push('Week number must be between 1 and 4');
    }

    if (!request.muscleGroup?.trim()) {
      errors.push('Muscle group is required');
    }

    if (!request.exerciseToDelete?.trim()) {
      errors.push('Exercise name is required');
    }

    return errors;
  }
}

export default new WorkoutService();