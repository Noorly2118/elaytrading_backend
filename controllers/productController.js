import Product from "../models/product.js";
import Category from "../models/Category.js"
import mongoose from "mongoose";
import XLSX from "xlsx";


export const getProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 9999, minPrice, maxPrice, inStock } = req.query;

    let filter = {};

    // CATEGORY
    if (category && category !== "all") {
      const categoryDoc = await Category.findOne({ slug: category });

      if (!categoryDoc) {
        return res.json({ products: [], totalPages: 0, currentPage: Number(page) });
      }

      filter.category = categoryDoc._id;
    }

    // ✅ PRICE FILTER
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // ✅ STOCK FILTER
    if (inStock === "true") {
      filter.stock = { $gt: 0 };
    }

    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .skip(skip)
      .limit(Number(limit));

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// GET single
export const getProductById = async (req, res) => {
  try {
const product = await Product.findById(req.params.id)
  .populate("category");

console.log(product);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const importProducts = async (req, res) => {
 

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Excel file required",
      });
    }

    const workbook = XLSX.readFile(
      req.file.path
    );

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const rows =
      XLSX.utils.sheet_to_json(sheet);

    let imported = 0;
    let failed = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      

      try {
       const categoryName = String(row.category).trim();

const category = await Category.findOne({
  name: {
    $regex: `^${categoryName}$`,
    $options: "i",
  },
});

        if (!category) {
          failed.push({
            row: i + 2,
            product: row.Name,
            error: "Category not found" ,
          });

          continue;
        }

      await Product.create({
  name: row.name,
  description: row.description,
  price: Number(row.price),
  stock: Number(row.stock),
  image: row.image,
  category: category._id,
});

        imported++;
      } catch (err) {
        failed.push({
          row: i + 2,
          product: row.Name,
          error: err.message,
        });
      }
    }


    res.json({
      success: true,
      imported,
      failedCount: failed.length,
      failed,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getRelatedProducts = async (req, res) => {
  try {
    const { categoryId, productId } = req.query;

    if (!categoryId || !productId) {
      return res.status(400).json({ message: "Missing params" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(categoryId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const products = await Product.find({
      category: categoryId,   // ✅ DON'T convert (mongoose handles it)
      _id: { $ne: productId }
    }).limit(4);

    res.json(products);

  } catch (err) {
    console.error("🔥 BACKEND ERROR:", err); // 👈 THIS IS THE TRUTH
    res.status(500).json({ message: err.message });
  }
};

// CREATE
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};