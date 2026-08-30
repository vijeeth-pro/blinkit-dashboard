import { Router } from 'express';
import { getSalesAnalytics } from '../controllers/sales.controller.js';
import { validateFilterQuery } from '../middleware/validation.middleware.js';

const router = Router();

router.get('/analytics', validateFilterQuery, getSalesAnalytics);

export default router;
