const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/jwt");
const { ROLES } = require("../constants/roles");

const bootstrapAdmin = asyncHandler(async (req, res) => {
  const existingUsersCount = await User.countDocuments();
  if (existingUsersCount > 0) {
    throw new ApiError(409, "First admin can only be created before any user exists.");
  }

  const admin = await User.create({
    ...req.body,
    role: ROLES.ADMIN,
    isActive: true
  });

  const token = signToken({ userId: admin._id, role: admin.role });

  res.status(201).json({
    success: true,
    message: "Bootstrap admin created successfully.",
    data: {
      token,
      user: admin
    }
  });
});

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, "Email already registered.");
  }

  const user = await User.create({
    fullName,
    email: normalizedEmail,
    password,
    role: ROLES.VIEWER,
    isActive: true
  });

  const token = signToken({ userId: user._id, role: user.role });

  res.status(201).json({
    success: true,
    message: "User registered successfully.",
    data: {
      token,
      user
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is inactive. Contact an admin.");
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = signToken({ userId: user._id, role: user.role });

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      token,
      user: user.toJSON()
    }
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

module.exports = {
  bootstrapAdmin,
  register,
  login,
  getCurrentUser
};
