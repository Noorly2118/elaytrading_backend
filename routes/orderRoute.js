import express from "express";
import {
  createOrder,
  getOrders,
  getRecentOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  verifyPayment,
  rejectPayment,
} from "../controllers/orderController.js";

import { protectUser } from "../middleware/protectUser.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

// User
router.post("/", protectUser, createOrder);
// router.get("/:id", protectUser, getOrderById);
router.put("/:id/cancel", protectUser, cancelOrder);

// Admin
router.get("/", protectAdmin, getOrders);
router.get("/recent", protectAdmin, getRecentOrders);

router.get("/:id", protectAdmin, getOrderById);

router.put("/:id", protectAdmin, updateOrderStatus);

router.put(
  "/:id/verify-payment",
  protectAdmin,
  verifyPayment
);

router.put(
  "/:id/reject-payment",
  protectAdmin,
  rejectPayment
);

export default router;