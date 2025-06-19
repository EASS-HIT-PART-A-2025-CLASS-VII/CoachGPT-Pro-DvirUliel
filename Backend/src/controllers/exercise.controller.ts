import { Request, Response } from 'express';
import { pool } from '../db/db';

export const getAllExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM exercises ORDER BY name ASC');

    // Validate that we actually have exercises
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'No exercises found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      count: result.rows.length,
      exercises: result.rows
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to load exercises',
      error: (error as Error).message
    });
  }
};
