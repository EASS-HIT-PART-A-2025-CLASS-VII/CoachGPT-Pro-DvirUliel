import { Request, Response } from 'express';
import { 
  isValidUUID,
  findWeek,
  findDayByMuscleGroup,
  exerciseExistsInDay,
  addExerciseToDay,
  deleteExerciseFromDay
} from '../utils/planUtils';
import { sendError, sendSuccess } from '../utils/responseUtils';
import { getRandomExercises, swapExerciseInPlan } from '../utils/exerciseUtils';
import { getPlanFromDB, updatePlanInDB, logAction } from '../utils/databaseUtils';
import { capitalize } from '../utils/stringUtils';
import { MUSCLE_SPLIT, DIFFICULTY_CONFIG } from '../utils/constants';
import { pool } from '../db/db';

// Type interfaces for better TypeScript support
interface Exercise {
  name: string;
  sets: number;
  reps: number;
}

interface WorkoutDay {
  day: string;
  exercises: Exercise[];
}

interface WorkoutWeek {
  week: number;
  days: WorkoutDay[];
}

// Generate a full workout plan
export const generatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, goal, daysPerWeek, difficultyLevel } = req.body;

    // Validation
    if (!userId || !goal || !daysPerWeek || !difficultyLevel) {
      return sendError(res, 400, 'Missing required fields');
    }
    if (!isValidUUID(userId)) {
      return sendError(res, 400, 'Invalid userId format');
    }

    // Get configuration for difficulty level
    const baseConfig = DIFFICULTY_CONFIG[difficultyLevel as keyof typeof DIFFICULTY_CONFIG];
    if (!baseConfig) {
      return sendError(res, 400, 'Invalid difficulty level');
    }

    // Initialize with proper types
    const weeks: WorkoutWeek[] = [];

    for (let week = 1; week <= 4; week++) {
      const days: WorkoutDay[] = [];
      
      // Progressive overload logic
      let { sets, reps } = baseConfig;
      if (week === 2) reps += 2;
      else if (week === 3) sets += 1;
      else if (week === 4) {
        reps += 2;
        sets += 1;
      }

      for (let day = 0; day < daysPerWeek; day++) {
        const [primary, secondary] = MUSCLE_SPLIT[day % MUSCLE_SPLIT.length];

        // Get exercises for both muscle groups
        const [primaryExercises, secondaryExercises] = await Promise.all([
          getRandomExercises(primary, difficultyLevel, 3, sets, reps),
          getRandomExercises(secondary, difficultyLevel, 2, sets, reps)
        ]);

        if (primaryExercises.length < 3 || secondaryExercises.length < 2) {
          return sendError(res, 400, `Not enough exercises for ${primary}/${secondary} at ${difficultyLevel} level`);
        }

        // Now TypeScript knows the correct types
        days.push({
          day: `Day ${day + 1} - ${capitalize(primary)} + ${capitalize(secondary)}`,
          exercises: [...primaryExercises, ...secondaryExercises]
        });
      }

      // TypeScript knows this is correct now
      weeks.push({ week, days });
    }

    // Save plan to database
    const result = await pool.query(
      'INSERT INTO workout_plans (user_id, goal, days_per_week, plan_data) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, goal, daysPerWeek, { weeks }]
    );

    sendSuccess(res, { plan: result.rows[0] }, 201);
  } catch (error) {
    console.error('Error generating plan:', error);
    sendError(res, 500, 'Server error while generating plan');
  }
};

// Get latest workout plan for a user
export const getPlanByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!isValidUUID(userId)) {
      return sendError(res, 400, 'Invalid userId format');
    }

    const result = await pool.query(
      'SELECT * FROM workout_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'No plan found for this user');
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('getPlanByUser error:', error);
    sendError(res, 500, 'Server error');
  }
};

// Get workout plan by ID
export const getPlanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const result = await pool.query('SELECT * FROM workout_plans WHERE id = $1', [planId]);

    if (result.rows.length === 0) {
      return sendError(res, 404, 'Workout plan not found');
    }

    sendSuccess(res, { plan: result.rows[0] });
  } catch (error) {
    console.error('Error fetching plan by ID:', error);
    sendError(res, 500, 'Server error fetching workout plan');
  }
};

// Swap exercises in plan
export const swapExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const { currentExercise, newExercise, weekNumber } = req.body;

    if (!planId || !currentExercise || !newExercise) {
      return sendError(res, 400, 'Missing required fields');
    }

    const plan = await getPlanFromDB(planId);
    if (!plan) return sendError(res, 404, 'Workout plan not found');

    const { planData, modified, skippedWeeks } = swapExerciseInPlan(
      plan.plan_data, 
      currentExercise, 
      newExercise, 
      weekNumber
    );

    if (!modified) {
      return sendError(res, 404, 'Exercise to replace not found in the plan');
    }

    const updatedPlan = await updatePlanInDB(planId, planData);
    await logAction(planId, 'swap', currentExercise, newExercise, weekNumber);

    const message = skippedWeeks.length > 0 
      ? `Swap completed. Skipped weeks: ${skippedWeeks.join(', ')}` 
      : 'Swap completed successfully.';

    sendSuccess(res, { message, updatedPlan });
  } catch (error) {
    console.error('Error swapping exercise:', error);
    sendError(res, 500, 'Server error while swapping exercise');
  }
};

// Add exercise to plan
export const addExerciseToPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const { weekNumber, muscleGroup, newExercise } = req.body;

    if (!planId || !weekNumber || !muscleGroup || !newExercise) {
      return sendError(res, 400, 'Missing required fields');
    }

    const plan = await getPlanFromDB(planId);
    if (!plan) return sendError(res, 404, 'Workout plan not found');

    const week = findWeek(plan.plan_data, weekNumber);
    if (!week) return sendError(res, 404, 'Week not found');

    const day = findDayByMuscleGroup(week, muscleGroup);
    if (!day) return sendError(res, 404, `No day found for muscle group: ${muscleGroup}`);

    if (exerciseExistsInDay(day, newExercise)) {
      return sendError(res, 400, 'Exercise already exists in the day');
    }

    addExerciseToDay(day, newExercise);

    const updatedPlan = await updatePlanInDB(planId, plan.plan_data);
    await logAction(planId, 'add', null, newExercise, weekNumber, day.day);

    sendSuccess(res, {
      message: `Exercise added successfully to ${day.day}.`,
      updatedPlan
    });
  } catch (error) {
    console.error('Error adding exercise:', error);
    sendError(res, 500, 'Server error while adding exercise');
  }
};

// Delete exercise from plan
export const deleteExerciseFromPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const { weekNumber, muscleGroup, exerciseToDelete } = req.body;

    if (!planId || !weekNumber || !muscleGroup || !exerciseToDelete) {
      return sendError(res, 400, 'Missing required fields');
    }

    const plan = await getPlanFromDB(planId);
    if (!plan) return sendError(res, 404, 'Workout plan not found');

    const week = findWeek(plan.plan_data, weekNumber);
    if (!week) return sendError(res, 404, 'Week not found');

    const day = findDayByMuscleGroup(week, muscleGroup);
    if (!day) return sendError(res, 404, `No day found for muscle group: ${muscleGroup}`);

    const deleted = deleteExerciseFromDay(day, exerciseToDelete);
    if (!deleted) return sendError(res, 404, 'Exercise not found in the day');

    const updatedPlan = await updatePlanInDB(planId, plan.plan_data);
    await logAction(planId, 'delete', exerciseToDelete, null, weekNumber, day.day);

    sendSuccess(res, {
      message: `Exercise deleted successfully from ${day.day}.`,
      updatedPlan
    });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    sendError(res, 500, 'Server error while deleting exercise');
  }
};

// Delete full workout plan
export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    if (!planId) return sendError(res, 400, 'Missing planId');

    const result = await pool.query('DELETE FROM workout_plans WHERE id = $1 RETURNING *', [planId]);
    if (result.rows.length === 0) return sendError(res, 404, 'Workout plan not found');

    sendSuccess(res, {
      message: 'Workout plan deleted successfully.',
      deletedPlan: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    sendError(res, 500, 'Server error while deleting plan');
  }
};

// Get plan action history
export const getPlanActions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    if (!planId) return sendError(res, 400, 'Missing planId');

    const result = await pool.query(
      'SELECT * FROM plan_actions WHERE plan_id = $1 ORDER BY created_at ASC',
      [planId]
    );

    sendSuccess(res, { actions: result.rows });
  } catch (error) {
    console.error('Error fetching plan actions:', error);
    sendError(res, 500, 'Server error while fetching plan actions');
  }
};