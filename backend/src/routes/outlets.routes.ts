import { Router } from 'express';
import { getOutletAnalytics } from '../controllers/outlets.controller.js';
import { validateFilterQuery } from '../middleware/validation.middleware.js';

const router = Router();

router.get('/analytics', validateFilterQuery, getOutletAnalytics);

export default router;
