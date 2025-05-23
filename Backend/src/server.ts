import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import planRoutes from './routes/planRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import authRoutes from './routes/authRoutes';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mounting the routes
app.use('/plan', planRoutes);
app.use('/exercises', exerciseRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Workout Plan Service running at http://localhost:${PORT}`);
});
