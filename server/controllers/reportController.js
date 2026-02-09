import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import User from "../models/User.js";

// @desc    Get financial dashboard data
// @route   GET /api/reports/dashboard
// @access  Private
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();
    const firstDayMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const lastDayMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );

    // Get current month transactions
    const monthTransactions = await Transaction.find({
      user: userId,
      date: {$gte: firstDayMonth, $lte: lastDayMonth},
    });

    // Get active budgets
    const activeBudgets = await Budget.find({
      user: userId,
      isActive: true,
      startDate: {$lte: currentDate},
      endDate: {$gte: currentDate},
    });

    // Calculate totals
    const monthIncome = monthTransactions
      .filter((t) => t.type === "ingreso")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthExpenses = monthTransactions
      .filter((t) => t.type === "gasto")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthBalance = monthIncome - monthExpenses;

    // Category breakdown
    const expensesByCategory = {};
    monthTransactions
      .filter((t) => t.type === "gasto")
      .forEach((t) => {
        if (!expensesByCategory[t.category]) {
          expensesByCategory[t.category] = 0;
        }
        expensesByCategory[t.category] += t.amount;
      });

    // Budget health
    const budgetHealth = activeBudgets.map((b) => ({
      id: b._id,
      name: b.name,
      category: b.category,
      amount: b.amount,
      spent: b.spent,
      remaining: b.remaining,
      percentageUsed: b.percentageUsed,
      status:
        b.percentageUsed > 100
          ? "over"
          : b.percentageUsed >= 80
            ? "warning"
            : "good",
    }));

    // Recent transactions
    const recentTransactions = await Transaction.find({user: userId})
      .sort({date: -1})
      .limit(5)
      .populate("budget", "name");

    res.status(200).json({
      success: true,
      data: {
        summary: {
          monthIncome,
          monthExpenses,
          monthBalance,
          transactionCount: monthTransactions.length,
          activeBudgetsCount: activeBudgets.length,
        },
        expensesByCategory,
        budgetHealth,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener datos del dashboard",
      error: error.message,
    });
  }
};

// @desc    Get monthly comparison report
// @route   GET /api/reports/monthly-comparison
// @access  Private
export const getMonthlyComparison = async (req, res) => {
  try {
    const userId = req.user.id;
    const {months = 6} = req.query;

    const monthsData = [];
    const currentDate = new Date();

    for (let i = 0; i < parseInt(months); i++) {
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i + 1,
        0,
      );

      const transactions = await Transaction.find({
        user: userId,
        date: {$gte: startDate, $lte: endDate},
      });

      const income = transactions
        .filter((t) => t.type === "ingreso")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter((t) => t.type === "gasto")
        .reduce((sum, t) => sum + t.amount, 0);

      monthsData.unshift({
        month: startDate.toLocaleString("es-AR", {
          month: "long",
          year: "numeric",
        }),
        income,
        expenses,
        balance: income - expenses,
        transactionCount: transactions.length,
      });
    }

    res.status(200).json({
      success: true,
      data: monthsData,
    });
  } catch (error) {
    console.error("Get monthly comparison error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener comparación mensual",
      error: error.message,
    });
  }
};

// @desc    Get category spending report
// @route   GET /api/reports/category-spending
// @access  Private
export const getCategorySpending = async (req, res) => {
  try {
    const userId = req.user.id;
    const {startDate, endDate} = req.query;

    const query = {user: userId, type: "gasto"};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query);

    const categoryData = {};
    let totalSpending = 0;

    transactions.forEach((t) => {
      if (!categoryData[t.category]) {
        categoryData[t.category] = {
          category: t.category,
          total: 0,
          count: 0,
          transactions: [],
        };
      }
      categoryData[t.category].total += t.amount;
      categoryData[t.category].count += 1;
      categoryData[t.category].transactions.push({
        date: t.date,
        description: t.description,
        amount: t.amount,
      });
      totalSpending += t.amount;
    });

    // Calculate percentages
    const categoryArray = Object.values(categoryData)
      .map((cat) => ({
        ...cat,
        percentage: ((cat.total / totalSpending) * 100).toFixed(2),
      }))
      .sort((a, b) => b.total - a.total);

    res.status(200).json({
      success: true,
      data: {
        totalSpending,
        categories: categoryArray,
      },
    });
  } catch (error) {
    console.error("Get category spending error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener gastos por categoría",
      error: error.message,
    });
  }
};

// @desc    Get admin overview (Admin only)
// @route   GET /api/reports/admin-overview
// @access  Private/Admin
export const getAdminOverview = async (req, res) => {
  try {
    // Count users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({isActive: true});
    const adminCount = await User.countDocuments({role: "admin"});
    const employeeCount = await User.countDocuments({role: "employee"});

    // Count budgets and transactions
    const totalBudgets = await Budget.countDocuments();
    const activeBudgets = await Budget.countDocuments({isActive: true});
    const totalTransactions = await Transaction.countDocuments();

    // Get all transactions for global stats
    const allTransactions = await Transaction.find();

    const globalIncome = allTransactions
      .filter((t) => t.type === "ingreso")
      .reduce((sum, t) => sum + t.amount, 0);

    const globalExpenses = allTransactions
      .filter((t) => t.type === "gasto")
      .reduce((sum, t) => sum + t.amount, 0);

    // User activity
    const userActivity = await User.aggregate([
      {
        $lookup: {
          from: "transactions",
          localField: "_id",
          foreignField: "user",
          as: "transactions",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          transactionCount: {$size: "$transactions"},
          lastActivity: {$max: "$transactions.createdAt"},
        },
      },
      {$sort: {transactionCount: -1}},
      {$limit: 10},
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminCount,
          employees: employeeCount,
        },
        budgets: {
          total: totalBudgets,
          active: activeBudgets,
        },
        transactions: {
          total: totalTransactions,
          globalIncome,
          globalExpenses,
          globalBalance: globalIncome - globalExpenses,
        },
        topUsers: userActivity,
      },
    });
  } catch (error) {
    console.error("Get admin overview error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener resumen administrativo",
      error: error.message,
    });
  }
};
