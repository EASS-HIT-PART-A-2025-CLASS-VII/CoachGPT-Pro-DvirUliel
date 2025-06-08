import { pool } from '../db/db';

// Get plan from database
export async function getPlanFromDB(planId: string) {
  const result = await pool.query('SELECT * FROM workout_plans WHERE id = $1', [planId]);
  return result.rows[0] || null;
}

// Update plan in database
export async function updatePlanInDB(planId: string, planData: any) {
  const result = await pool.query(
    'UPDATE workout_plans SET plan_data = $1 WHERE id = $2 RETURNING *',
    [planData, planId]
  );
  return result.rows[0];
}

// Log action to database
export async function logAction(
  planId: string, 
  actionType: string, 
  oldExercise?: string | null, 
  newExercise?: string | null, 
  weekNumber?: number, 
  dayName?: string
) {
  await pool.query(
    'INSERT INTO plan_actions (plan_id, action_type, old_exercise, new_exercise, week_number, day_name) VALUES ($1, $2, $3, $4, $5, $6)',
    [planId, actionType, oldExercise, newExercise, weekNumber || null, dayName || null]
  );
}
