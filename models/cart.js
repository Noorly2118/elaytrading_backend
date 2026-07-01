import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product ID is required"],
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, "Quantity must be at least 1"],
    max: [99, "Quantity cannot exceed 99"],
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for total items count
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to calculate total items
cartSchema.methods.getTotalItems = function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

// Method to check if product exists
cartSchema.methods.hasProduct = function(productId) {
  return this.items.some(item => item.productId.toString() === productId.toString());
};

// Method to get item by productId
cartSchema.methods.getItemByProductId = function(productId) {
  return this.items.find(item => item.productId.toString() === productId.toString());
};

// NO PRE-SAVE MIDDLEWARE - This avoids the error entirely

export default mongoose.model("Cart", cartSchema);