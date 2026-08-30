import { Request, Response, NextFunction } from 'express';
import { SalesService } from '../services/sales.service.js';

const service = new SalesService();

export async function getSalesAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = req.query as any;
    const data = await service.getSalesAnalytics(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
