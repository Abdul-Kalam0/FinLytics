import { GoogleGenerativeAI } from "@google/generative-ai";
import RecordModel from "../models/record.js";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getAIInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ Aggregated data (same as before)
    const summary = await RecordModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
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
    ]);

    const categoryData = await RecordModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    const monthlyData = await RecordModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 3 },
    ]);

    const summaryData = summary[0] || { income: 0, expense: 0 };

    // ✅ Prompt
    const prompt = `
You are a financial advisor AI.

Analyze this financial data and give 3-5 short insights.

Income: ${summaryData.income}
Expense: ${summaryData.expense}

Top Categories:
${JSON.stringify(categoryData)}

Recent Months:
${JSON.stringify(monthlyData)}

Give practical advice in simple bullet points.
`;

    // ✅ Gemini Model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      success: true,
      data: {
        summary: summaryData,
        insights: text,
      },
    });
  } catch (error) {
    console.error("Gemini Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "AI insight generation failed",
    });
  }
};

export const chatWithAI = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // ✅ Fetch limited user data (important for performance)
    const records = await RecordModel.find({ userId })
      .sort({ date: -1 })
      .limit(20);

    // ✅ Build prompt
    const prompt = `
You are a financial assistant.

User financial records:
${JSON.stringify(records)}

User question:
${message}

Answer clearly in simple language.
If calculation is needed, do it carefully.
`;

    // ✅ Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      success: true,
      reply: text,
    });
  } catch (error) {
    console.error("Chatbot Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "AI chat failed",
    });
  }
};
