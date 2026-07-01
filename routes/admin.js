import express from "express";
import { loginAdmin} from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import {getAdminStats} from "../controllers/statsController.js";

const router = express.Router();



// Public route
router.post("/login", loginAdmin);

// Example protected route
router.get("/dashboard", protectAdmin, (req, res) => {
  res.json({ message: "Admin dashboard access granted" });
});
router.get("/stats", getAdminStats);

export default router;
