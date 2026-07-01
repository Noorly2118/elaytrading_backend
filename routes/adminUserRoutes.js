import express from "express";
import {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../controllers/User.js";

import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

/**
 * Admin Only Routes
 */

// Get all users
router.get("/", protectAdmin, getUsers);

// Get single user
router.get("/:id", protectAdmin, getUserById);

// Update user role (user/admin)
router.put("/:id/role", protectAdmin, updateUserRole);

// Block / Unblock user
router.put("/:id/status", protectAdmin, updateUserStatus);

// Delete user
router.delete("/:id", protectAdmin, deleteUser);

export default router;