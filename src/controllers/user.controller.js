const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const buildUserQuery = (query) => {
  const filter = {};

  if (query.role) {
    filter.role = query.role;
  }

  if (typeof query.isActive === "boolean") {
    filter.isActive = query.isActive;
  }

  if (query.search) {
    filter.$or = [
      { fullName: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } }
    ];
  }

  return filter;
};

const createUser = asyncHandler(async (req, res) => {
  const normalizedEmail = req.body.email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, "Email already registered.");
  }

  const user = await User.create({
    ...req.body,
    email: normalizedEmail
  });

  res.status(201).json({
    success: true,
    message: "User created successfully.",
    data: user
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const skip = (page - 1) * limit;

  const filter = buildUserQuery(req.query);

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (String(req.user._id) === String(user._id) && req.body.isActive === false) {
    throw new ApiError(400, "Admin cannot deactivate their own account.");
  }

  Object.assign(user, req.body);
  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully.",
    data: user
  });
});

const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (String(req.user._id) === String(id)) {
    throw new ApiError(400, "Admin cannot deactivate their own account.");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User deactivated successfully.",
    data: user
  });
});

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser
};
