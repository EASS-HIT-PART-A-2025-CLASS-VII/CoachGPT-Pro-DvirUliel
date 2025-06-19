import express from 'express';
import { getAllExercises } from '../controllers/exercise.controller';

const router = express.Router();

router.get('/', getAllExercises);

export default router;
