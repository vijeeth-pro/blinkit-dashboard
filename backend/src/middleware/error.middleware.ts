import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('API Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error occurred';
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(status).json({
    success: false,
    message,
    errorCode,
  });
}
