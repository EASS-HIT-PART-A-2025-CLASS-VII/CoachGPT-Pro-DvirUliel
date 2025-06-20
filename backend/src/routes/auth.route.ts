import express from 'express';
import { registerUser, loginUser, deleteUser } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/delete/:userId', deleteUser);

export default router;

