import express from 'express';
import { addExerciseToPlan, deleteExerciseFromPlan, deletePlan, generatePlan, getPlanActions, getPlanById, getPlanByUser, swapExercise } from '../controllers/planController';
const router = express.Router();


// Generate a new 4-week workout plan
router.post('/generate', generatePlan); 

// Get the latest plan created by a specific user
router.get('/user/:userId', getPlanByUser); 

// Get a workout plan by its ID
router.get('/:planId', getPlanById); 

// Swap one exercise with another in a plan, can swap with a specific week or whole program
router.patch('/:planId/swap-exercise', swapExercise); 

// Add a new exercise to a workout day based on muscle group
router.patch('/:planId/add-exercise', addExerciseToPlan);

// Delete an exercise from a specific muscle group day
router.patch('/:planId/delete-exercise', deleteExerciseFromPlan); 

// Delete a workout plan completely
router.delete('/:planId/delete-plan', deletePlan); 

// Get all action history for a workout plan
router.get('/:planId/actions', getPlanActions);


export default router;
