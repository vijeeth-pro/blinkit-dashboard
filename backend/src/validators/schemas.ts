import Joi from 'joi';

export const globalFiltersSchema = Joi.object({
  startDate: Joi.string().allow('').optional(),
  endDate: Joi.string().allow('').optional(),
  category: Joi.string().max(100).allow('').optional(),
  customerSegment: Joi.string().max(100).allow('').optional(),
  paymentMethod: Joi.string().max(100).allow('').optional(),
  deliveryStatus: Joi.string().max(100).allow('').optional(),
  storeId: Joi.string().allow('').optional(),
  search: Joi.string().max(200).allow('').optional(),
  sortBy: Joi.string().max(50).optional(),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').optional(),
  page: Joi.alternatives().try(Joi.number(), Joi.string().pattern(/^[0-9]+$/)).optional(),
  limit: Joi.alternatives().try(Joi.number(), Joi.string().pattern(/^[0-9]+$/)).optional(),
}).unknown(true);
