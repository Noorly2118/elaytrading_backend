import Product from "../models/product.js";
import Order from "../models/order.js"; 

export const getAdminStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    const categories = await Product.distinct("category");
    const totalCategories = categories.length;

    const products = await Product.find();
    const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);

    let recentOrders = 0;

     recentOrders = await Order.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
     });

    res.json({
      totalProducts,
      totalCategories,
      totalValue,
      recentOrders,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};