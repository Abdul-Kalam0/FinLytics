import RecordModel from "../models/record.js";

// 📊 1. SUMMARY (Income, Expense, Net Balance)
export const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await RecordModel.aggregate([
      {
        $match: { userId },
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
    ]);

    const data = result[0] || { totalIncome: 0, totalExpense: 0 };

    return res.status(200).json({
      success: true,
      data: {
        totalIncome: data.totalIncome,
        totalExpense: data.totalExpense,
        netBalance: data.totalIncome - data.totalExpense, // ✅ FIXED
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 📊 2. CATEGORY-WISE TOTALS (Income + Expense separated)
export const getCategoryTotals = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await RecordModel.aggregate([
      {
        $match: { userId },
      },
      {
        $group: {
          _id: {
            category: "$category",
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 📊 3. MONTHLY TRENDS (Income + Expense separated)
export const getMonthlyTrends = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await RecordModel.aggregate([
      {
        $match: { userId },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
