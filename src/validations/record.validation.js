const Joi = require("joi");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createRecordSchema = Joi.object({
  body: Joi.object({
    amount: Joi.number().positive().required(),
    type: Joi.string().valid("income", "expense").required(),
    category: Joi.string().trim().min(2).max(80).required(),
    date: Joi.date().required(),
    notes: Joi.string().allow("").max(500).default("")
  }).required(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional()
});

const updateRecordSchema = Joi.object({
  body: Joi.object({
    amount: Joi.number().positive(),
    type: Joi.string().valid("income", "expense"),
    category: Joi.string().trim().min(2).max(80),
    date: Joi.date(),
    notes: Joi.string().allow("").max(500)
  })
    .min(1)
    .required(),
  params: Joi.object({
    id: Joi.string().pattern(objectIdRegex).required()
  }).required(),
  query: Joi.object({}).optional()
});

const recordIdParamSchema = Joi.object({
  body: Joi.object({}).optional(),
  params: Joi.object({
    id: Joi.string().pattern(objectIdRegex).required()
  }).required(),
  query: Joi.object({}).optional()
});

const listRecordsSchema = Joi.object({
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    type: Joi.string().valid("income", "expense"),
    category: Joi.string().trim(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    minAmount: Joi.number().positive(),
    maxAmount: Joi.number().positive(),
    sortBy: Joi.string().valid("date", "amount", "createdAt").default("date"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    includeDeleted: Joi.boolean().default(false)
  }).required()
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  recordIdParamSchema,
  listRecordsSchema
};
