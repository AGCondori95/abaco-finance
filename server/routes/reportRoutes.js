import express from "express";
import {
  getDashboard,
  getMonthlyComparison,
  getCategorySpending,
  getAdminOverview,
} from "../controllers/reportController.js";
import {protect, authorize} from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboard);
router.get("/monthly-comparison", getMonthlyComparison);
router.get("/category-spending", getCategorySpending);
router.get("/admin-overview", authorize("admin"), getAdminOverview);

export default router;
