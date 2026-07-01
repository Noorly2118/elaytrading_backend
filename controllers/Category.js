import Category from "../models/Category.js";

// Create category (admin)
export const createCategory = async (req, res) => {
  const { name, slug } = req.body;
  const category = await Category.create({ name, slug });
  res.status(201).json(category);
};

// Get all categories (public)
export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json(categories);
};

// Update category (admin)
export const updateCategory = async (req, res) => {
  const { name, slug } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, slug },
    { new: true }
  );
  res.json(category);
};

// Delete category (admin)
export const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted" });
};
