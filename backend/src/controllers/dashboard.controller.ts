import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service.js';

const service = new DashboardService();

export async function getDashboardSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = req.query as any;
    const data = await service.getDashboardData(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
