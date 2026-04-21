import express from "express";

const router = express.Router();
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";
import {
  createRecord,
  deleteRecord,
  getRecords,
  updateRecord,
} from "../controllers/recordController.js";

router.post(
  "/records",
  authMiddleware,
  authorize("admin", "analyst"),
  createRecord,
);

router.get(
  "/records",
  authMiddleware,
  authorize("admin", "analyst", "viewer"),
  getRecords,
);

// update
router.patch(
  "/records/:id",
  authMiddleware,
  authorize("admin", "analyst"),
  updateRecord,
);

// delete
router.delete(
  "/records/:id",
  authMiddleware,
  authorize("admin", "analyst"),
  deleteRecord,
);

export default router;
