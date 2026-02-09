import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import {protect} from "../middleware/auth.js";
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
} from "../middleware/validators.js";

const router = express.Router();

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

// Protected routes
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.put(
  "/change-password",
  protect,
  changePasswordValidation,
  changePassword,
);

export default router;
