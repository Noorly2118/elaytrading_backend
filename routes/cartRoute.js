import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
} from "../controllers/cartController.js";
import { protectUser } from "../middleware/protectUser.js";

const router = express.Router();

// All cart routes require authentication
router.use(protectUser);

// Routes
router.get("/", getCart);
router.get("/count", getCartCount); // New utility endpoint
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:productId", removeFromCart);
router.delete("/clear", clearCart);

export default router;