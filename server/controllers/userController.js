import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const {role, isActive} = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const users = await User.find(query).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
};

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Get user statistics
    const budgetCount = await Budget.countDocuments({user: user._id});
    const transactionCount = await Transaction.countDocuments({user: user._id});

    const transactions = await Transaction.find({user: user._id});
    const totalIncome = transactions
      .filter((t) => t.type === "ingreso")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "gasto")
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          budgetCount,
          transactionCount,
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
        },
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const {name, email, role, department, isActive} = req.body;

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({email});
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "El email ya está en uso",
        });
      }
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name || user.name,
        email: email || user.email,
        role: role || user.role,
        department: department !== undefined ? department : user.department,
        isActive: isActive !== undefined ? isActive : user.isActive,
      },
      {new: true, runValidators: true},
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar usuario",
      error: error.message,
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "No puedes eliminar tu propia cuenta",
      });
    }

    // Delete user's budgets and transactions
    await Budget.deleteMany({user: user._id});
    await Transaction.deleteMany({user: user._id});
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "Usuario y datos asociados eliminados exitosamente",
      data: {},
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
};
