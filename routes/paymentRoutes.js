import express from "express";
import {
  getVerifiedPayments,
  getPaymentStats,
} from "../controllers/paymentController.js";

import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

router.get(
  "/",
  protectAdmin,
  getVerifiedPayments
);

router.get(
  "/stats",
  protectAdmin,
  getPaymentStats
);

export default router;