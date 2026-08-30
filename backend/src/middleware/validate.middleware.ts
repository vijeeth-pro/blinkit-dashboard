import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export function validateRequest(schema: Schema, property: 'body' | 'query' | 'params' = 'query') {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: false,
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message.replace(/"/g, "'")).join(', ');
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: `Security validation failed: ${errorMessage}`,
      });
    }

    req[property] = value;
    next();
  };
}
