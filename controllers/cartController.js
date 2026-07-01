import Cart from "../models/cart.js";
import Product from "../models/product.js";
import mongoose from "mongoose";

// =========================
// GET CART
// =========================
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let cart = await Cart.findOne({ userId })
      .populate("items.productId", "name price image stock description");

    if (!cart) {
      cart = await Cart.create({
        userId: userId,
        items: [],
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching cart", 
      error: error.message 
    });
  }
};

// =========================
// ADD TO CART
// =========================
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ 
        success: false,
        message: "Product ID is required" 
      });
    }

    if (quantity < 1 || quantity > 99) {
      return res.status(400).json({ 
        success: false,
        message: "Quantity must be between 1 and 99" 
      });
    }

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ 
        success: false,
        message: `Sorry, "${product.name}" is out of stock!` 
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({
        userId: userId,
        items: [],
      });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          success: false,
          message: `Cannot add more than ${product.stock} items. Only ${product.stock - cart.items[itemIndex].quantity} more available.`
        });
      }
      
      if (newQuantity > 99) {
        return res.status(400).json({ 
          success: false,
          message: "Cannot exceed 99 items per product" 
        });
      }
      
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      // Add new item
      if (quantity > product.stock) {
        return res.status(400).json({ 
          success: false,
          message: `Only ${product.stock} items available in stock.`
        });
      }
      
      cart.items.push({
        productId,
        quantity,
      });
    }

    await cart.save();

    // Return populated cart
    const updatedCart = await Cart.findOne({ userId })
      .populate("items.productId", "name price image stock");

    res.status(200).json({
      success: true,
      message: itemIndex > -1 ? "Cart updated successfully" : "Item added to cart",
      data: updatedCart
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error adding to cart", 
      error: error.message 
    });
  }
};

// =========================
// UPDATE CART ITEM
// =========================
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ 
        success: false,
        message: "Product ID is required" 
      });
    }

    if (quantity < 0 || quantity > 99) {
      return res.status(400).json({ 
        success: false,
        message: "Quantity must be between 0 and 99" 
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: "Cart not found" 
      });
    }

    const itemIndex = cart.items.findIndex(
      (i) => i.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: "Item not found in cart" 
      });
    }

    // Remove item if quantity is 0
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock before updating
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: "Product not found" 
        });
      }
      
      if (quantity > product.stock) {
        return res.status(400).json({ 
          success: false,
          message: `Only ${product.stock} items available in stock.`
        });
      }
      
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ userId })
      .populate("items.productId", "name price image stock");

    res.status(200).json({
      success: true,
      message: quantity === 0 ? "Item removed from cart" : "Cart updated successfully",
      data: updatedCart
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error updating cart", 
      error: error.message 
    });
  }
};

// =========================
// REMOVE FROM CART (WORKING VERSION)
// =========================
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;


    if (!productId) {
      return res.status(400).json({ 
        success: false,
        message: "Product ID is required" 
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: "Cart not found" 
      });
    }

    // Filter out the item
    const originalLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    if (cart.items.length === originalLength) {
      return res.status(404).json({ 
        success: false,
        message: "Item not found in cart" 
      });
    }

    await cart.save();

    // Return updated cart
    const updatedCart = await Cart.findOne({ userId })
      .populate("items.productId", "name price image stock");

    res.status(200).json({
      success: true,
      message: "Item removed successfully",
      data: updatedCart
    });
  } catch (error) {
    console.error("Remove error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error removing item", 
      error: error.message 
    });
  }
};

// =========================
// CLEAR CART
// =========================
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: "Cart not found" 
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error clearing cart", 
      error: error.message 
    });
  }
};

// =========================
// GET CART COUNT
// =========================
export const getCartCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const cart = await Cart.findOne({ userId });
    
    const itemCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    
    res.status(200).json({
      success: true,
      count: itemCount
    });
  } catch (error) {
    console.error("Get cart count error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching cart count", 
      error: error.message 
    });
  }
};