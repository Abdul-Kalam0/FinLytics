import express from "express";
import {
  getCategoryTotals,
  getMonthlyTrends,
  getSummary,
} from "../controllers/analyticsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get(
  "/summary",
  authMiddleware,
  authorize("admin", "analyst", "viewer"),
  getSummary,
);

router.get(
  "/category-totals",
  authMiddleware,
  authorize("admin", "analyst", "viewer"),
  getCategoryTotals,
);

router.get(
  "/monthly-trends",
  authMiddleware,
  authorize("admin", "analyst", "viewer"),
  getMonthlyTrends,
);

export default router;
