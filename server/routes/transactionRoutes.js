import express from "express";
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} from "../controllers/transactionController.js";
import {protect} from "../middleware/auth.js";
import {transactionValidation} from "../middleware/validators.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/stats", getTransactionStats);
router
  .route("/")
  .get(getTransactions)
  .post(transactionValidation, createTransaction);

router
  .route("/:id")
  .get(getTransaction)
  .put(transactionValidation, updateTransaction)
  .delete(deleteTransaction);

export default router;
