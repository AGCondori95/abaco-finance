import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import {validationResult} from "express-validator";

// @desc    Get all transactions for logged user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const {type, category, startDate, endDate, budget} = req.query;

    // Build query
    const query = {user: req.user.id};

    if (type) query.type = type;
    if (category) query.category = category;
    if (budget) query.budget = budget;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({date: -1})
      .populate("user", "name email")
      .populate("budget", "name category");

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener transacciones",
      error: error.message,
    });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("user", "name email")
      .populate("budget", "name category amount spent");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transacción no encontrada",
      });
    }

    // Check ownership or admin role
    if (
      transaction.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "No autorizado para ver esta transacción",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener transacción",
      error: error.message,
    });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      budget,
      type,
      category,
      amount,
      description,
      date,
      paymentMethod,
      notes,
      tags,
      isRecurring,
      recurringFrequency,
    } = req.body;

    // Validate budget if provided
    if (budget) {
      const budgetDoc = await Budget.findById(budget);

      if (!budgetDoc) {
        return res.status(404).json({
          success: false,
          message: "Presupuesto no encontrado",
        });
      }

      // Check budget ownership
      if (budgetDoc.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "No autorizado para usar este presupuesto",
        });
      }

      // Check if budget is active
      if (!budgetDoc.isActive) {
        return res.status(400).json({
          success: false,
          message: "El presupuesto no está activo",
        });
      }

      // Check if transaction date is within budget period
      const transDate = new Date(date || Date.now());
      if (transDate < budgetDoc.startDate || transDate > budgetDoc.endDate) {
        return res.status(400).json({
          success: false,
          message:
            "La fecha de la transacción está fuera del período del presupuesto",
        });
      }
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      budget: req.body.budget,
      type,
      category,
      amount: req.body.amount,
      description,
      date: date || Date.now(),
      paymentMethod,
      notes,
      tags,
      isRecurring,
      recurringFrequency,
    });

    res.status(201).json({
      success: true,
      message: "Transacción creada exitosamente",
      data: transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear transacción",
      error: error.message,
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transacción no encontrada",
      });
    }

    // Check ownership or admin role
    if (
      transaction.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "No autorizado para actualizar esta transacción",
      });
    }

    const oldAmount = transaction.amount;
    const oldType = transaction.type;
    const oldBudget = transaction.budget;

    // Update transaction
    const updateData = req.body;
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      {new: true, runValidators: true},
    )
      .populate("user", "name email")
      .populate("budget", "name category");

    // Update budget spent if amount or type or budget changed
    if (
      oldBudget &&
      oldType === "gasto" &&
      (oldAmount !== transaction.amount ||
        oldType !== transaction.type ||
        oldBudget.toString() !== transaction.budget?.toString())
    ) {
      // Revert old budget
      await Budget.findByIdAndUpdate(oldBudget, {
        $inc: {spent: -oldAmount},
      });

      // Update new budget if applicable
      if (transaction.budget && transaction.type === "gasto") {
        await Budget.findByIdAndUpdate(transaction.budget, {
          $inc: {spent: transaction.amount},
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Transacción actualizada exitosamente",
      data: transaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar transacción",
      error: error.message,
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transacción no encontrada",
      });
    }

    // Check ownership or admin role
    if (
      transaction.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "No autorizado para eliminar esta transacción",
      });
    }

    if (transaction.budget && transaction.type === "gasto") {
      await Budget.findByIdAndUpdate(transaction.budget, {
        $inc: {spent: -transaction.amount},
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: "Transacción eliminada exitosamente",
      data: {},
    });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar transacción",
      error: error.message,
    });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
export const getTransactionStats = async (req, res) => {
  try {
    const {startDate, endDate} = req.query;

    const query = {user: req.user.id};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query);

    const stats = {
      totalTransactions: transactions.length,
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      byCategory: {},
      byPaymentMethod: {},
      recentTransactions: [],
    };

    transactions.forEach((transaction) => {
      if (transaction.type === "ingreso") {
        stats.totalIncome += transaction.amount;
      } else {
        stats.totalExpenses += transaction.amount;
      }

      // Group by category
      if (!stats.byCategory[transaction.category]) {
        stats.byCategory[transaction.category] = {
          count: 0,
          total: 0,
          type: transaction.type,
        };
      }
      stats.byCategory[transaction.category].count += 1;
      stats.byCategory[transaction.category].total += transaction.amount;

      // Group by payment method
      if (!stats.byPaymentMethod[transaction.paymentMethod]) {
        stats.byPaymentMethod[transaction.paymentMethod] = {
          count: 0,
          total: 0,
        };
      }
      stats.byPaymentMethod[transaction.paymentMethod].count += 1;
      stats.byPaymentMethod[transaction.paymentMethod].total +=
        transaction.amount;
    });

    stats.balance = stats.totalIncome - stats.totalExpenses;

    // Get recent transactions (last 10)
    stats.recentTransactions = await Transaction.find(query)
      .sort({date: -1})
      .limit(10)
      .populate("budget", "name category");

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get transaction stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message,
    });
  }
};
