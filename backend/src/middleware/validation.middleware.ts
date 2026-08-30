import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const filterQueryJoiSchema = Joi.object({
  startDate: Joi.string().allow('').optional(),
  endDate: Joi.string().allow('').optional(),
  category: Joi.string().max(100).allow('').optional(),
  customerSegment: Joi.string().max(100).allow('').optional(),
  paymentMethod: Joi.string().max(100).allow('').optional(),
  deliveryStatus: Joi.string().max(100).allow('').optional(),
  storeId: Joi.string().allow('').optional(),
  search: Joi.string().max(200).allow('').optional(),
  page: Joi.alternatives().try(Joi.number(), Joi.string().pattern(/^[0-9]+$/)).optional(),
  limit: Joi.alternatives().try(Joi.number(), Joi.string().pattern(/^[0-9]+$/)).optional(),
  sortBy: Joi.string().max(50).optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').optional(),
}).unknown(true);

export const requestBodyJoiSchema = Joi.object({
  name: Joi.string().max(200).optional(),
  email: Joi.string().email().optional(),
  filters: Joi.object().optional(),
  data: Joi.any().optional(),
}).unknown(true);

export function validateFilterQuery(req: Request, res: Response, next: NextFunction) {
  const { error } = filterQueryJoiSchema.validate(req.query, { abortEarly: false });
  if (error) {
    const details = error.details.map(d => d.message.replace(/"/g, "'"));
    return res.status(400).json({
      success: false,
      message: `Joi security validation failed: ${details.join(', ')}`,
      errorCode: 'JOI_VALIDATION_ERROR',
      details,
    });
  }
  next();
}

export function validateRequestBody(req: Request, res: Response, next: NextFunction) {
  if (req.body && Object.keys(req.body).length > 0) {
    const { error } = requestBodyJoiSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map(d => d.message.replace(/"/g, "'"));
      return res.status(400).json({
        success: false,
        message: `Joi body validation failed: ${details.join(', ')}`,
        errorCode: 'JOI_BODY_VALIDATION_ERROR',
        details,
      });
    }
  }
  next();
}
