import { Request, Response, NextFunction } from 'express';
import { ProductsService } from '../services/products.service.js';

const service = new ProductsService();

export async function getProductAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = req.query as any;
    const sortBy = (req.query.sortBy as string) || 'totalRevenue';
    const sortOrder = (req.query.sortOrder as string) || 'DESC';

    const data = await service.getProductAnalytics(filters, sortBy, sortOrder);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
