"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_controller_1 = require("../controllers/health.controller");
const error_middleware_1 = require("../middlewares/error.middleware");
const router = (0, express_1.Router)();
const healthController = new health_controller_1.HealthController();
router.get('/', (0, error_middleware_1.asyncHandler)(healthController.basicHealth));
router.get('/detailed', (0, error_middleware_1.asyncHandler)(healthController.detailedHealth));
router.get('/ready', (0, error_middleware_1.asyncHandler)(healthController.readinessProbe));
router.get('/live', healthController.livenessProbe);
router.get('/dependencies', (0, error_middleware_1.asyncHandler)(healthController.dependenciesStatus));
router.get('/metrics', (0, error_middleware_1.asyncHandler)(healthController.performanceMetrics));
router.get('/test', (0, error_middleware_1.asyncHandler)(healthController.testGeneration));
exports.default = router;
//# sourceMappingURL=health.route.js.map