import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import { asyncHandler } from '../middlewares/error.middleware';

// Create router instance
const router = Router();

// Create controller instance
const healthController = new HealthController();

// Basic health check
router.get('/', asyncHandler(healthController.basicHealth));

// Detailed health check with comprehensive service info
router.get('/detailed', asyncHandler(healthController.detailedHealth));

// Readiness probe - for Kubernetes/Docker readiness checks
router.get('/ready', asyncHandler(healthController.readinessProbe));

// Liveness probe - for Kubernetes/Docker liveness checks  
router.get('/live', healthController.livenessProbe);

// Service dependencies status
router.get('/dependencies', asyncHandler(healthController.dependenciesStatus));

// Performance metrics and response times
router.get('/metrics', asyncHandler(healthController.performanceMetrics));

// AI generation test
router.get('/test', asyncHandler(healthController.testGeneration));

export default router;