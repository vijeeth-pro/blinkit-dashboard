import { Request, Response, NextFunction } from 'express';
import { OutletsService } from '../services/outlets.service.js';

const service = new OutletsService();

export async function getOutletAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = req.query as any;
    const sortBy = (req.query.sortBy as string) || 'totalSales';
    const sortOrder = (req.query.sortOrder as string) || 'DESC';

    const data = await service.getOutletAnalytics(filters, sortBy, sortOrder);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
