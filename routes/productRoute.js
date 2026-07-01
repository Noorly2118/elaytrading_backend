import express from "express";
import {getProducts,getProductById,createProduct,updateProduct,deleteProduct,getRelatedProducts,
importProducts} from "../controllers/productController.js";

import { protectAdmin } from "../middleware/protectAdmin.js";
import { uploadExcel } from "../middleware/uploadExcel.js";


const router = express.Router();

router.post(
  "/import",
  protectAdmin,
  uploadExcel.single("file"),
  importProducts
);
// PUBLIC
router.get("/", getProducts);
router.get("/related", getRelatedProducts);  
router.get("/:id", getProductById);

// ADMIN ONLY
router.post("/", protectAdmin, createProduct);
router.put("/:id", protectAdmin, updateProduct);
router.delete("/:id", protectAdmin, deleteProduct);

export default router;