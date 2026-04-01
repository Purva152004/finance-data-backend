const Record = require("../models/record.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const buildRecordFilter = (query, role) => {
  const filter = {};

  if (query.type) {
    filter.type = query.type;
  }

  if (query.category) {
    filter.category = { $regex: query.category, $options: "i" };
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) {
      filter.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.date.$lte = new Date(query.endDate);
    }
  }

  if (query.minAmount || query.maxAmount) {
    filter.amount = {};
    if (query.minAmount) {
      filter.amount.$gte = Number(query.minAmount);
    }
    if (query.maxAmount) {
      filter.amount.$lte = Number(query.maxAmount);
    }
  }

  const includeDeleted = query.includeDeleted === true || query.includeDeleted === "true";
  filter.isDeleted = role === "admin" && includeDeleted ? { $in: [true, false] } : false;

  return filter;
};

const createRecord = asyncHandler(async (req, res) => {
  const record = await Record.create({
    ...req.body,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: "Record created successfully.",
    data: record
  });
});

const getRecords = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const skip = (page - 1) * limit;
  const sortBy = req.query.sortBy || "date";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  const filter = buildRecordFilter(req.query, req.user.role);

  const [records, total] = await Promise.all([
    Record.find(filter)
      .populate("createdBy", "fullName email role")
      .sort({ [sortBy]: sortOrder, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Record.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: records,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

const getRecordById = asyncHandler(async (req, res) => {
  const record = await Record.findOne({
    _id: req.params.id,
    isDeleted: false
  }).populate("createdBy", "fullName email role");

  if (!record) {
    throw new ApiError(404, "Record not found.");
  }

  res.status(200).json({
    success: true,
    data: record
  });
});

const updateRecord = asyncHandler(async (req, res) => {
  const record = await Record.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!record) {
    throw new ApiError(404, "Record not found.");
  }

  Object.assign(record, req.body);
  await record.save();

  res.status(200).json({
    success: true,
    message: "Record updated successfully.",
    data: record
  });
});

const deleteRecord = asyncHandler(async (req, res) => {
  const record = await Record.findById(req.params.id);

  if (!record || record.isDeleted) {
    throw new ApiError(404, "Record not found.");
  }

  record.isDeleted = true;
  record.deletedAt = new Date();
  await record.save();

  res.status(200).json({
    success: true,
    message: "Record soft-deleted successfully."
  });
});

const restoreRecord = asyncHandler(async (req, res) => {
  const record = await Record.findById(req.params.id);
  if (!record) {
    throw new ApiError(404, "Record not found.");
  }

  if (!record.isDeleted) {
    throw new ApiError(400, "Record is already active.");
  }

  record.isDeleted = false;
  record.deletedAt = null;
  await record.save();

  res.status(200).json({
    success: true,
    message: "Record restored successfully.",
    data: record
  });
});

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  restoreRecord
};
