import express from "express";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import {protect, authorize} from "../middleware/auth.js";

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getAllUsers);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

export default router;
