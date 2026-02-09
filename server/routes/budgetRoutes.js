import express from "express";
import {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
} from "../controllers/budgetController.js";
import {protect} from "../middleware/auth.js";
import {budgetValidation} from "../middleware/validators.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/summary", getBudgetSummary);
router.route("/").get(getBudgets).post(budgetValidation, createBudget);

router
  .route("/:id")
  .get(getBudget)
  .put(budgetValidation, updateBudget)
  .delete(deleteBudget);

export default router;
