import express from "express";
import { getAIInsights, chatWithAI } from "../controllers/aiController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// insights
router.get("/ai/insights", authMiddleware, getAIInsights);

// chatbot
router.post("/ai/chat", authMiddleware, chatWithAI);

export default router;
