import express from "express";
import { getMyOrders } from "../controllers/Myorders.js";
import { protectUser } from "../middleware/protectUser.js";

const router = express.Router();

// GET logged-in user's orders
router.get("/", protectUser, getMyOrders);

export default router;