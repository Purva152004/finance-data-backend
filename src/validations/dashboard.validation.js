const Joi = require("joi");

const overviewSchema = Joi.object({
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date()
  }).required()
});

const trendsSchema = Joi.object({
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date(),
    period: Joi.string().valid("monthly", "weekly").default("monthly")
  }).required()
});

const recentActivitySchema = Joi.object({
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(20).default(5)
  }).required()
});

module.exports = {
  overviewSchema,
  trendsSchema,
  recentActivitySchema
};
