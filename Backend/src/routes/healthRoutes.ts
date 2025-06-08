import express from 'express';
import { healthCheck, readyCheck, liveCheck } from '../controllers/healthController';

const router = express.Router();

// Health check endpoint (with database test)
router.get('/health', healthCheck);

// Ready check endpoint (Kubernetes readiness probe)
router.get('/ready', readyCheck);

// Live check endpoint (Kubernetes liveness probe)
router.get('/live', liveCheck);

export default router;