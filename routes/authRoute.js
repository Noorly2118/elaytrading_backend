import express from "express";
import { 
  registerUser, 
  loginUser, 
  verifyEmail,
  resendVerificationCode,
  checkAuthStatus 
} from "../controllers/User.js";
// import { protectUser } from "../middleware/protectUser.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationCode);

// Protected routes
// router.get("/auth-status", protectUser, checkAuthStatus);

export default router;