const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyToken } = require("../utils/jwt");

const auth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization token is required.");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token.");
  }

  const user = await User.findById(decoded.userId).select("-password");
  if (!user) {
    throw new ApiError(401, "User no longer exists.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account is inactive. Contact an admin.");
  }

  req.user = user;
  next();
});

module.exports = auth;
