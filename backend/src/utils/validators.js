const Joi = require('joi');

const scraperConfigSchema = Joi.object({
  name: Joi.string().required().min(3).max(255),
  scraperType: Joi.string().required().valid('ecommerce', 'jobs', 'news'),
  targetUrl: Joi.string().required().uri(),
  scheduleCron: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  configJson: Joi.object().optional()
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional()
});

module.exports = {
  scraperConfigSchema,
  paginationSchema,
  dateRangeSchema
};