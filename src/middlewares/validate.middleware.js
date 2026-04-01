const ApiError = require("../utils/ApiError");

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(
      {
        body: req.body,
        params: req.params,
        query: req.query
      },
      {
        abortEarly: false,
        stripUnknown: true
      }
    );

    if (error) {
      const details = error.details.map((detail) => detail.message);
      return next(new ApiError(400, "Validation failed.", details));
    }

    req.body = value.body || {};
    req.params = value.params || {};
    req.query = value.query || {};
    return next();
  };
};

module.exports = validate;
