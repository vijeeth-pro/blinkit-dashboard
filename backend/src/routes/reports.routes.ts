import { Router } from 'express';
import { getSalesReport, exportReportCsv } from '../controllers/reports.controller.js';
import { validateFilterQuery } from '../middleware/validation.middleware.js';

const router = Router();

router.get('/sales', validateFilterQuery, getSalesReport);
router.get('/export', validateFilterQuery, exportReportCsv);

export default router;
