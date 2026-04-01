const Record = require("../models/record.model");
const asyncHandler = require("../utils/asyncHandler");

const buildDateMatch = (query) => {
  const match = { isDeleted: false };

  if (query.startDate || query.endDate) {
    match.date = {};
    if (query.startDate) {
      match.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      match.date.$lte = new Date(query.endDate);
    }
  }

  return match;
};

const getOverview = asyncHandler(async (req, res) => {
  const match = buildDateMatch(req.query);

  const [totalsResult, categoryTotals, recentActivity, trends] = await Promise.all([
    Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
            }
          }
        }
      }
    ]),
    Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { total: -1 } }
    ]),
    Record.find(match)
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .populate("createdBy", "fullName role"),
    Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])
  ]);

  const totals = totalsResult[0] || { totalIncome: 0, totalExpenses: 0 };
  const netBalance = totals.totalIncome - totals.totalExpenses;

  res.status(200).json({
    success: true,
    data: {
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpenses,
      netBalance,
      categoryTotals,
      recentActivity,
      monthlyTrends: trends
    }
  });
});

const getTrends = asyncHandler(async (req, res) => {
  const match = buildDateMatch(req.query);
  const period = req.query.period || "monthly";

  const groupId =
    period === "weekly"
      ? {
          year: { $isoWeekYear: "$date" },
          week: { $isoWeek: "$date" },
          type: "$type"
        }
      : {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type"
        };

  const trends = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: groupId,
        total: { $sum: "$amount" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: trends
  });
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit || 5);
  const records = await Record.find({ isDeleted: false })
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .populate("createdBy", "fullName role");

  res.status(200).json({
    success: true,
    data: records
  });
});

module.exports = {
  getOverview,
  getTrends,
  getRecentActivity
};
