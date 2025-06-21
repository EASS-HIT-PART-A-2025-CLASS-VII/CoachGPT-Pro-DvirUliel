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

  // Enhanced debugging for swap exercise
  async swapExercise(planId: string, request: ExerciseSwapRequest): Promise<{ message: string; updatedPlan: WorkoutPlan }> {
    try {
      // Log the original request
      console.log('🔄 SWAP REQUEST DEBUG:');
      console.log('📋 Original request object:', request);
      console.log('🆔 Plan ID:', planId);
      console.log('🎯 API endpoint:', `/plan/${planId}/swap-exercise`);
      
      // Backend expects: { currentExercise, newExercise, weekNumber }
      const backendRequest = {
        currentExercise: request.currentExercise,
        newExercise: request.newExercise,
        weekNumber: request.weekNumber
      };
      
      console.log('📤 Request payload being sent to backend:', JSON.stringify(backendRequest, null, 2));
      console.log('🔍 Payload field types:');
      console.log('  - currentExercise:', typeof backendRequest.currentExercise, '=', backendRequest.currentExercise);
      console.log('  - newExercise:', typeof backendRequest.newExercise, '=', backendRequest.newExercise);
      console.log('  - weekNumber:', typeof backendRequest.weekNumber, '=', backendRequest.weekNumber);
      
      // Validate request before sending
      if (!backendRequest.currentExercise || typeof backendRequest.currentExercise !== 'string') {
        throw new Error('Invalid currentExercise: must be a non-empty string');
      }
      if (!backendRequest.newExercise || typeof backendRequest.newExercise !== 'string') {
        throw new Error('Invalid newExercise: must be a non-empty string');
      }
      if (!backendRequest.weekNumber || typeof backendRequest.weekNumber !== 'number' || backendRequest.weekNumber < 1 || backendRequest.weekNumber > 4) {
        throw new Error('Invalid weekNumber: must be a number between 1 and 4');
      }
      
      console.log('✅ Request validation passed, sending to backend...');
      
      const response = await apiUtils.patch<{ status: string; message: string; updatedPlan: WorkoutPlan }>(
        `/plan/${planId}/swap-exercise`,
        backendRequest
      );
      
      console.log('✅ Swap response received:', response);
      
      return {
        message: response.message,
        updatedPlan: response.updatedPlan,
      };
    } catch (error: any) {
      console.error('🚨 SWAP ERROR DEBUGGING:');
      console.error('🔍 Error object:', error);
      console.error('📊 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        stack: error.stack
      });
      
      // Log the actual HTTP request that failed
      if (error.config) {
        console.error('🌐 Failed HTTP request config:', {
          method: error.config.method,
          url: error.config.url,
          baseURL: error.config.baseURL,
          headers: error.config.headers,
          data: error.config.data
        });
      }
      
      // Extract the most specific error message
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error.message || 
                          'Failed to swap exercise';
      
      throw new Error(errorMessage);
    }
  }

  // Enhanced debugging for add exercise
  async addExercise(planId: string, request: AddExerciseRequest): Promise<{ message: string; updatedPlan: WorkoutPlan }> {
    try {
      console.log('➕ ADD REQUEST DEBUG:');
      console.log('📋 Original request object:', request);
      console.log('🆔 Plan ID:', planId);
      console.log('🎯 API endpoint:', `/plan/${planId}/add-exercise`);
      
      // Backend expects: { weekNumber, muscleGroup, newExercise }
      const backendRequest = {
        weekNumber: request.weekNumber,
        muscleGroup: request.muscleGroup,
        newExercise: request.newExercise
      };
      
      console.log('📤 Request payload being sent to backend:', JSON.stringify(backendRequest, null, 2));
      console.log('🔍 Payload field types:');
      console.log('  - weekNumber:', typeof backendRequest.weekNumber, '=', backendRequest.weekNumber);
      console.log('  - muscleGroup:', typeof backendRequest.muscleGroup, '=', backendRequest.muscleGroup);
      console.log('  - newExercise:', typeof backendRequest.newExercise, '=', backendRequest.newExercise);
      
      // Validate request
      if (!backendRequest.weekNumber || typeof backendRequest.weekNumber !== 'number') {
        throw new Error('Invalid weekNumber: must be a number');
      }
      if (!backendRequest.muscleGroup || typeof backendRequest.muscleGroup !== 'string') {
        throw new Error('Invalid muscleGroup: must be a non-empty string');
      }
      if (!backendRequest.newExercise || typeof backendRequest.newExercise !== 'string') {
        throw new Error('Invalid newExercise: must be a non-empty string');
      }
      
      console.log('✅ Request validation passed, sending to backend...');
      
      const response = await apiUtils.patch<{ status: string; message: string; updatedPlan: WorkoutPlan }>(
        `/plan/${planId}/add-exercise`,
        backendRequest
      );
      
      console.log('✅ Add response received:', response);
      
      return {
        message: response.message,
        updatedPlan: response.updatedPlan,
      };
    } catch (error: any) {
      console.error('🚨 ADD ERROR DEBUGGING:');
      console.error('🔍 Error object:', error);
      console.error('📊 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.config) {
        console.error('🌐 Failed HTTP request config:', {
          method: error.config.method,
          url: error.config.url,
          data: error.config.data
        });
      }
      
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error.message || 
                          'Failed to add exercise';
      
      throw new Error(errorMessage);
    }
  }

  // Enhanced debugging for delete exercise
  async deleteExercise(planId: string, request: DeleteExerciseRequest): Promise<{ message: string; updatedPlan: WorkoutPlan }> {
    try {
      console.log('🗑️ DELETE REQUEST DEBUG:');
      console.log('📋 Original request object:', request);
      console.log('🆔 Plan ID:', planId);
      console.log('🎯 API endpoint:', `/plan/${planId}/delete-exercise`);
      
      // Backend expects: { weekNumber, muscleGroup, exerciseToDelete }
      const backendRequest = {
        weekNumber: request.weekNumber,
        muscleGroup: request.muscleGroup,
        exerciseToDelete: request.exerciseToDelete
      };
      
      console.log('📤 Request payload being sent to backend:', JSON.stringify(backendRequest, null, 2));
      console.log('🔍 Payload field types:');
      console.log('  - weekNumber:', typeof backendRequest.weekNumber, '=', backendRequest.weekNumber);
      console.log('  - muscleGroup:', typeof backendRequest.muscleGroup, '=', backendRequest.muscleGroup);
      console.log('  - exerciseToDelete:', typeof backendRequest.exerciseToDelete, '=', backendRequest.exerciseToDelete);
      
      // Validate request
      if (!backendRequest.weekNumber || typeof backendRequest.weekNumber !== 'number') {
        throw new Error('Invalid weekNumber: must be a number');
      }
      if (!backendRequest.muscleGroup || typeof backendRequest.muscleGroup !== 'string') {
        throw new Error('Invalid muscleGroup: must be a non-empty string');
      }
      if (!backendRequest.exerciseToDelete || typeof backendRequest.exerciseToDelete !== 'string') {
        throw new Error('Invalid exerciseToDelete: must be a non-empty string');
      }
      
      console.log('✅ Request validation passed, sending to backend...');
      
      const response = await apiUtils.patch<{ status: string; message: string; updatedPlan: WorkoutPlan }>(
        `/plan/${planId}/delete-exercise`,
        backendRequest
      );
      
      console.log('✅ Delete response received:', response);
      
      return {
        message: response.message,
        updatedPlan: response.updatedPlan,
      };
    } catch (error: any) {
      console.error('🚨 DELETE ERROR DEBUGGING:');
      console.error('🔍 Error object:', error);
      console.error('📊 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.config) {
        console.error('🌐 Failed HTTP request config:', {
          method: error.config.method,
          url: error.config.url,
          data: error.config.data
        });
      }
      
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error.message || 
                          'Failed to delete exercise';
      
      throw new Error(errorMessage);
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