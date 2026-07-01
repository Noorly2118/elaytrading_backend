import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: [
        "cbe",
        "awash",
        "dashen",
        "telebirr",
      ],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "verified",
        "rejected",
      ],
      default: "pending",
    },
   paymentLogs: [
  {
    action: String,
    date: {
      type: Date,
      default: Date.now,
    },
  },
],

    transactionId: {
      type: String,
      required: true,
      trim: true,
    },

    receiptImage: {
      type: String,
      default: "",
    },

    shippingInfo: {
      fullName: {
        type: String,
        required: true,
      },
      phone: String,
      city: String,
      address: String,
      note: String,
    },

    cancelledAt: Date,

    cancelReason: String,
  },
  {
    timestamps: true,
  }
);

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);

export default Order;