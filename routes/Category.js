import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/Category.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

router.get("/", getCategories); // public
router.post("/", protectAdmin, createCategory); // admin
router.put("/:id", protectAdmin, updateCategory); // admin
router.delete("/:id", protectAdmin, deleteCategory); // admin

export default router;



