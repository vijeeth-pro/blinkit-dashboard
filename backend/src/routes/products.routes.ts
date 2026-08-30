import { Router } from 'express';
import { getProductAnalytics } from '../controllers/products.controller.js';
import { validateFilterQuery } from '../middleware/validation.middleware.js';

const router = Router();

router.get('/analytics', validateFilterQuery, getProductAnalytics);

export default router;
