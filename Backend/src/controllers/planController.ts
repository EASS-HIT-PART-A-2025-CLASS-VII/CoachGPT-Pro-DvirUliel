import { Request, Response } from 'express';
import { pool } from '../db/db';
import { QueryResult } from 'pg';
import {
  isValidUUID,
  findWeek,
  findDayByMuscleGroup,
  exerciseExistsInDay,
  addExerciseToDay,
  deleteExerciseFromDay
} from '../utils/planUtils';

// ✅ Predefined weekly muscle split
const muscleGroupsByDay = [
  ['chest', 'triceps'],
  ['back', 'biceps'],
  ['legs', 'core'],
  ['shoulders', 'core']
];

// ✅ Generate a full workout plan
export const generatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, goal, daysPerWeek, difficultyLevel } = req.body;

    if (!userId || !goal || !daysPerWeek || !difficultyLevel) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!isValidUUID(userId)) {
      res.status(400).json({ error: 'Invalid userId format' });
      return;
    }

    const weeks = [];

    let baseSets = 3;
    let baseReps = 12;

    if (difficultyLevel === 'intermediate') {
      baseReps = 10;
    } else if (difficultyLevel === 'advanced') {
      baseSets = 4;
      baseReps = 8;
    }

    for (let week = 1; week <= 4; week++) {
      const days = [];

      let sets = baseSets;
      let reps = baseReps;

      if (week === 2) reps += 1;
      else if (week === 3) sets += 1;
      else if (week === 4) reps += 1;

      for (let day = 0; day < daysPerWeek; day++) {
        const [primaryMuscle, secondaryMuscle] = muscleGroupsByDay[day % muscleGroupsByDay.length];

        const primaryExercisesResult: QueryResult = await pool.query(
          'SELECT name FROM exercises WHERE difficulty = $1 AND muscle_group = $2 ORDER BY RANDOM() LIMIT 3',
          [difficultyLevel, primaryMuscle]
        );

        const primaryExercises = primaryExercisesResult.rows.map(row => ({
          name: row.name,
          sets,
          reps
        }));

        if (primaryExercises.length < 3) {
          res.status(400).json({ error: `Not enough exercises for ${primaryMuscle} at ${difficultyLevel} level` });
          return;
        }

        const secondaryExercisesResult: QueryResult = await pool.query(
          'SELECT name FROM exercises WHERE difficulty = $1 AND muscle_group = $2 ORDER BY RANDOM() LIMIT 2',
          [difficultyLevel, secondaryMuscle]
        );

        const secondaryExercises = secondaryExercisesResult.rows.map(row => ({
          name: row.name,
          sets,
          reps
        }));

        if (secondaryExercises.length < 2) {
          res.status(400).json({ error: `Not enough exercises for ${secondaryMuscle} at ${difficultyLevel} level` });
          return;
        }

        days.push({
          day: `Day ${day + 1} - ${primaryMuscle.charAt(0).toUpperCase() + primaryMuscle.slice(1)} + ${secondaryMuscle.charAt(0).toUpperCase() + secondaryMuscle.slice(1)}`,
          exercises: [...primaryExercises, ...secondaryExercises]
        });
      }

      weeks.push({ week, days });
    }

    const plan = { weeks };

    const result = await pool.query(
      'INSERT INTO workout_plans (user_id, goal, days_per_week, plan_data) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, goal, daysPerWeek, plan]
    );

    res.status(201).json({
      status: 'success',
      plan: result.rows[0]
    });

  } catch (error) {
    console.error('Error generating plan:', error);
    res.status(500).json({ error: 'Server error while generating plan' });
  }
};

// ✅ Get the latest workout plan for a user
export const getPlanByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!isValidUUID(userId)) {
      res.status(400).json({ error: 'Invalid userId format' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM workout_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No plan found for this user' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('getPlanByUser error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Get a workout plan by ID
export const getPlanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;

    const result = await pool.query(
      'SELECT * FROM workout_plans WHERE id = $1',
      [planId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Workout plan not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      plan: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching plan by ID:', error);
    res.status(500).json({ error: 'Server error fetching workout plan' });
  }
};

// ✅ Swap exercises
export const swapExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const { currentExercise, newExercise, weekNumber } = req.body;

    if (!planId || !currentExercise || !newExercise) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const planResult = await pool.query('SELECT * FROM workout_plans WHERE id = $1', [planId]);
    if (planResult.rows.length === 0) {
      res.status(404).json({ error: 'Workout plan not found' });
      return;
    }

    let planData = planResult.rows[0].plan_data;
    let modified = false;
    let skippedWeeks: number[] = [];

    planData.weeks.forEach((week: any) => {
      if (weekNumber && week.week !== weekNumber) return;

      if (week.days.some((day: any) => exerciseExistsInDay(day, newExercise))) {
        skippedWeeks.push(week.week);
        return;
      }

      week.days.forEach((day: any) => {
        day.exercises = day.exercises.map((exercise: any) => {
          const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;
          if (exerciseName.toLowerCase() === currentExercise.toLowerCase()) {
            modified = true;
            if (typeof exercise === 'string') {
              return newExercise;
            } else {
              return {
                ...exercise,
                name: newExercise
              };
            }
          }
          return exercise;
        });
      });
    });

    if (!modified) {
      res.status(404).json({ error: 'Exercise to replace not found in the plan' });
      return;
    }

    const updateResult = await pool.query('UPDATE workout_plans SET plan_data = $1 WHERE id = $2 RETURNING *', [planData, planId]);
    await pool.query('INSERT INTO plan_actions (plan_id, action_type, old_exercise, new_exercise, week_number) VALUES ($1, $2, $3, $4, $5)', [planId, 'swap', currentExercise, newExercise, weekNumber || null]);

    res.status(200).json({
      status: 'success',
      message: skippedWeeks.length > 0 ? `Swap completed. Skipped weeks: ${skippedWeeks.join(', ')}` : 'Swap completed successfully.',
      updatedPlan: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Error swapping exercise:', error);
    res.status(500).json({ error: 'Server error while swapping exercise' });
  }
};

// ✅ Delete a full workout plan by ID
export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;

    if (!planId) {
      res.status(400).json({ error: 'Missing planId' });
      return;
    }

    const deleteResult = await pool.query('DELETE FROM workout_plans WHERE id = $1 RETURNING *', [planId]);
    if (deleteResult.rows.length === 0) {
      res.status(404).json({ error: 'Workout plan not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Workout plan deleted successfully.',
      deletedPlan: deleteResult.rows[0]
    });

  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ error: 'Server error while deleting plan' });
  }
};

// ✅ Add a new exercise
export const addExerciseToPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const { weekNumber, muscleGroup, newExercise } = req.body;

    if (!planId || !weekNumber || !muscleGroup || !newExercise) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const planResult = await pool.query('SELECT * FROM workout_plans WHERE id = $1', [planId]);
    if (planResult.rows.length === 0) {
      res.status(404).json({ error: 'Workout plan not found' });
      return;
    }

    const planData = planResult.rows[0].plan_data;
    const week = findWeek(planData, weekNumber);

    if (!week) {
      res.status(404).json({ error: 'Week not found' });
      return;
    }

    const day = findDayByMuscleGroup(week, muscleGroup);
    if (!day) {
      res.status(404).json({ error: `No day found for muscle group: ${muscleGroup}` });
      return;
    }

    if (exerciseExistsInDay(day, newExercise)) {
      res.status(400).json({ error: 'Exercise already exists in the day' });
      return;
    }

    addExerciseToDay(day, newExercise);

    const updateResult = await pool.query('UPDATE workout_plans SET plan_data = $1 WHERE id = $2 RETURNING *', [planData, planId]);
    await pool.query('INSERT INTO plan_actions (plan_id, action_type, new_exercise, week_number, day_name) VALUES ($1, $2, $3, $4, $5)', [planId, 'add', newExercise, weekNumber, day.day]);

    res.status(200).json({
      status: 'success',
      message: `Exercise added successfully to ${day.day}.`,
      updatedPlan: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Error adding exercise:', error);
    res.status(500).json({ error: 'Server error while adding exercise' });
  }
};

// ✅ Delete an exercise
export const deleteExerciseFromPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;
    const { weekNumber, muscleGroup, exerciseToDelete } = req.body;

    if (!planId || !weekNumber || !muscleGroup || !exerciseToDelete) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const planResult = await pool.query('SELECT * FROM workout_plans WHERE id = $1', [planId]);
    if (planResult.rows.length === 0) {
      res.status(404).json({ error: 'Workout plan not found' });
      return;
    }

    const planData = planResult.rows[0].plan_data;
    const week = findWeek(planData, weekNumber);

    if (!week) {
      res.status(404).json({ error: 'Week not found' });
      return;
    }

    const day = findDayByMuscleGroup(week, muscleGroup);
    if (!day) {
      res.status(404).json({ error: `No day found for muscle group: ${muscleGroup}` });
      return;
    }

    const deleted = deleteExerciseFromDay(day, exerciseToDelete);
    if (!deleted) {
      res.status(404).json({ error: 'Exercise not found in the day' });
      return;
    }

    const updateResult = await pool.query('UPDATE workout_plans SET plan_data = $1 WHERE id = $2 RETURNING *', [planData, planId]);
    await pool.query('INSERT INTO plan_actions (plan_id, action_type, old_exercise, week_number, day_name) VALUES ($1, $2, $3, $4, $5)', [planId, 'delete', exerciseToDelete, weekNumber, day.day]);

    res.status(200).json({
      status: 'success',
      message: `Exercise deleted successfully from ${day.day}.`,
      updatedPlan: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Server error while deleting exercise' });
  }
};

// ✅ Get full action history
export const getPlanActions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.params;

    if (!planId) {
      res.status(400).json({ error: 'Missing planId' });
      return;
    }

    const result = await pool.query('SELECT * FROM plan_actions WHERE plan_id = $1 ORDER BY created_at ASC', [planId]);

    res.status(200).json({
      status: 'success',
      actions: result.rows
    });

  } catch (error) {
    console.error('Error fetching plan actions:', error);
    res.status(500).json({ error: 'Server error while fetching plan actions' });
  }
};