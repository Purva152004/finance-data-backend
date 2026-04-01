const Joi = require("joi");

const registerSchema = Joi.object({
  body: Joi.object({
    fullName: Joi.string().trim().min(2).max(80).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required()
  }).required(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional()
});

const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }).required(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional()
});

const bootstrapAdminSchema = Joi.object({
  body: Joi.object({
    fullName: Joi.string().trim().min(2).max(80).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required()
  }).required(),
  params: Joi.object({}).optional(),
  query: Joi.object({}).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  bootstrapAdminSchema
};
