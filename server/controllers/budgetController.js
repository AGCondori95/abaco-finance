import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import {validationResult} from "express-validator";

// @desc    Get all budgets for logged user
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res) => {
  try {
    const {category, isActive, period} = req.query;

    // Build query
    const query = {user: req.user.id};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (period) query.period = period;

    const budgets = await Budget.find(query)
      .sort({createdAt: -1})
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    console.error("Get budgets error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener presupuestos",
      error: error.message,
    });
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
export const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Presupuesto no encontrado",
      });
    }

    // Check ownership or admin role
    if (
      budget.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "No autorizado para ver este presupuesto",
      });
    }

    // Get associated transactions
    const transactions = await Transaction.find({
      budget: budget._id,
      type: "gasto",
    }).sort({date: -1});

    res.status(200).json({
      success: true,
      data: {
        budget,
        transactions,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    console.error("Get budget error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener presupuesto",
      error: error.message,
    });
  }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
export const createBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {name, description, category, amount, period, startDate, endDate} =
      req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message:
          "La fecha de finalización debe ser posterior a la fecha de inicio",
      });
    }

    const budget = await Budget.create({
      user: req.user.id,
      name,
      description,
      category,
      amount,
      period,
      startDate: start,
      endDate: end,
    });

    res.status(201).json({
      success: true,
      message: "Presupuesto creado exitosamente",
      data: budget,
    });
  } catch (error) {
    console.error("Create budget error:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear presupuesto",
      error: error.message,
    });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
export const updateBudget = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Presupuesto no encontrado",
      });
    }

    // Check ownership or admin role
    if (budget.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No autorizado para actualizar este presupuesto",
      });
    }

    const {
      name,
      description,
      category,
      amount,
      period,
      startDate,
      endDate,
      isActive,
    } = req.body;

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        return res.status(400).json({
          success: false,
          message:
            "La fecha de finalización debe ser posterior a la fecha de inicio",
        });
      }
    }

    budget = await Budget.findByIdAndUpdate(
      req.params.id,
      {
        name: name || budget.name,
        description:
          description !== undefined ? description : budget.description,
        category: category || budget.category,
        amount: amount || budget.amount,
        period: period || budget.period,
        startDate: startDate || budget.startDate,
        endDate: endDate || budget.endDate,
        isActive: isActive !== undefined ? isActive : budget.isActive,
      },
      {new: true, runValidators: true},
    );

    res.status(200).json({
      success: true,
      message: "Presupuesto actualizado exitosamente",
      data: budget,
    });
  } catch (error) {
    console.error("Update budget error:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar presupuesto",
      error: error.message,
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Presupuesto no encontrado",
      });
    }

    // Check ownership or admin role
    if (budget.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No autorizado para eliminar este presupuesto",
      });
    }

    // Remove budget reference from associated transactions
    await Transaction.updateMany({budget: budget._id}, {$unset: {budget: 1}});

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: "Presupuesto eliminado exitosamente",
      data: {},
    });
  } catch (error) {
    console.error("Delete budget error:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar presupuesto",
      error: error.message,
    });
  }
};

// @desc    Get budget summary
// @route   GET /api/budgets/summary
// @access  Private
export const getBudgetSummary = async (req, res) => {
  try {
    const budgets = await Budget.find({
      user: req.user.id,
      isActive: true,
    });

    const summary = {
      totalBudgets: budgets.length,
      totalAllocated: budgets.reduce((sum, b) => sum + b.amount, 0),
      totalSpent: budgets.reduce((sum, b) => sum + b.spent, 0),
      totalRemaining: budgets.reduce((sum, b) => sum + (b.amount - b.spent), 0),
      byCategory: {},
      overBudget: [],
      nearLimit: [], // >= 80% usage
    };

    budgets.forEach((budget) => {
      // Group by category
      if (!summary.byCategory[budget.category]) {
        summary.byCategory[budget.category] = {
          allocated: 0,
          spent: 0,
          count: 0,
        };
      }
      summary.byCategory[budget.category].allocated += budget.amount;
      summary.byCategory[budget.category].spent += budget.spent;
      summary.byCategory[budget.category].count += 1;

      // Check over budget
      if (budget.spent > budget.amount) {
        summary.overBudget.push({
          id: budget._id,
          name: budget.name,
          category: budget.category,
          amount: budget.amount,
          spent: budget.spent,
          overage: budget.spent - budget.amount,
        });
      }

      // Check near limit
      const percentUsed = budget.percentageUsed;
      if (percentUsed >= 80 && percentUsed <= 100) {
        summary.nearLimit.push({
          id: budget._id,
          name: budget.name,
          category: budget.category,
          amount: budget.amount,
          spent: budget.spent,
          percentUsed: percentUsed.toFixed(2),
        });
      }
    });

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Get budget summary error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener resumen de presupuestos",
      error: error.message,
    });
  }
};
