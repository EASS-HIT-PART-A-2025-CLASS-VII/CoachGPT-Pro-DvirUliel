import { pool } from '../db/db';
import { QueryResult } from 'pg';

// Get random exercises for a muscle group
export async function getRandomExercises(
  muscleGroup: string, 
  difficulty: string, 
  count: number, 
  sets: number, 
  reps: number
) {
  const result: QueryResult = await pool.query(
    'SELECT name FROM exercises WHERE difficulty = $1 AND muscle_group = $2 ORDER BY RANDOM() LIMIT $3',
    [difficulty, muscleGroup, count]
  );

  return result.rows.map(row => ({ name: row.name, sets, reps }));
}

// Swap exercise logic
export function swapExerciseInPlan(
  planData: any, 
  currentExercise: string, 
  newExercise: string, 
  weekNumber?: number
) {
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
          return typeof exercise === 'string' ? newExercise : { ...exercise, name: newExercise };
        }
        return exercise;
      });
    });
  });

  return { planData, modified, skippedWeeks };
}

// Check if exercise exists in day (assuming this is in your existing planUtils)
function exerciseExistsInDay(day: any, exerciseName: string): boolean {
  return day.exercises.some((exercise: any) => {
    const name = typeof exercise === 'string' ? exercise : exercise.name;
    return name.toLowerCase() === exerciseName.toLowerCase();
  });
}