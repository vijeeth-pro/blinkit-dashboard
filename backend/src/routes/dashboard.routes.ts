import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';
import { validateFilterQuery } from '../middleware/validation.middleware.js';

const router = Router();

router.get('/summary', validateFilterQuery, getDashboardSummary);

export default router;
