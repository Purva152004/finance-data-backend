const Joi = require("joi");
const { ROLE_VALUES } = require("../constants/roles");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createUserSchema = Joi.object({
  body: Joi.object({
    fullName: Joi.string().trim().min(2).max(80).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string()
      .valid(...ROLE_VALUES)
      .default("viewer"),
    isActive: Joi.boolean().default(true)
  }).required(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional()
});

const updateUserSchema = Joi.object({
  body: Joi.object({
    fullName: Joi.string().trim().min(2).max(80),
    role: Joi.string().valid(...ROLE_VALUES),
    isActive: Joi.boolean()
  })
    .min(1)
    .required(),
  params: Joi.object({
    id: Joi.string().pattern(objectIdRegex).required()
  }).required(),
  query: Joi.object({}).optional()
});

const userIdParamSchema = Joi.object({
  body: Joi.object({}).optional(),
  params: Joi.object({
    id: Joi.string().pattern(objectIdRegex).required()
  }).required(),
  query: Joi.object({}).optional()
});

const listUsersSchema = Joi.object({
  body: Joi.object({}).optional(),
  params: Joi.object({}).optional(),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().allow(""),
    role: Joi.string().valid(...ROLE_VALUES),
    isActive: Joi.boolean()
  }).required()
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  listUsersSchema
};
