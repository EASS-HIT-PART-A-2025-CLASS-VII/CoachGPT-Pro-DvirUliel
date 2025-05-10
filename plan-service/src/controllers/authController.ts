import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/db'; 
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config(); //  Load environment variables


const JWT_SECRET = process.env.JWT_SECRET as string;

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const result = await pool.query(
      'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, email, hashedPassword]
    );

    res.status(201).json({
      status: 'success',
      user: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    if (error.code === '23505') { // unique violation
      res.status(409).json({ error: 'Email already in use' });
    } else {
      res.status(500).json({ error: 'Server error during registration' });
    }
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// ✅ Delete a user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
  
      if (!userId) {
        res.status(400).json({ error: 'Missing userId' });
        return;
      }
  
      const deleteResult = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
  
      if (deleteResult.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
  
      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
        deletedUser: deleteResult.rows[0]
      });
  
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Server error while deleting user' });
    }
  };