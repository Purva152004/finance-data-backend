const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  if (err.name === "CastError") {
    err = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue || {})[0] || "field";
    err = new ApiError(409, `${duplicatedField} already exists.`);
  }

  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => e.message);
    err = new ApiError(400, "Validation failed.", details);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.details || null,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};

module.exports = errorHandler;
