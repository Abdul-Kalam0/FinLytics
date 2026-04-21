import RecordModel from "../models/record.js";

export const createRecord = async (req, res) => {
  let { amount, type, category, date, notes } = req.body;
  try {
    //validate input
    if (!amount || !type || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All required field must be provided",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type",
      });
    }

    const newRecord = await RecordModel.create({
      userId: req.user.id,
      amount,
      type,
      category,
      date,
      notes,
    });
    res.status(201).json({
      success: true,
      message: "Record created successfully",
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRecords = async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    // base query (VERY IMPORTANT)
    const query = {
      userId: req.user.id,
    };

    // 🔍 filter: type
    if (type) {
      query.type = type;
    }

    // 🔍 filter: category
    if (category) {
      query.category = category;
    }

    // 🔍 filter: date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // pagination
    const skip = (page - 1) * limit;

    const records = await RecordModel.find(query)
      .sort({ date: -1 }) // latest first
      .skip(skip)
      .limit(Number(limit));

    const total = await RecordModel.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Record ID is required",
      });
    }

    const record = await RecordModel.findOne({
      id,
      userId: req.user.id, // 🔐 ownership check
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    // update fields only if provided
    if (amount !== undefined) record.amount = amount;

    if (type) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid type",
        });
      }
      record.type = type;
    }

    if (category) record.category = category;
    if (date) record.date = date;
    if (notes !== undefined) record.notes = notes;

    await record.save();

    res.status(200).json({
      success: true,
      message: "Record updated successfully",
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Record ID is required",
      });
    }

    const record = await RecordModel.findOne({
      id,
      userId: req.user.id, // 🔐 ownership check
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    await RecordModel.deleteOne({ id });

    res.status(200).json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
