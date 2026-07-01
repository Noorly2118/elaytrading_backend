import Order from "../models/order.js";

// Get all verified payments
export const getVerifiedPayments = async (req, res) => {
  try {
    const payments = await Order.find({
      paymentStatus: "verified",
    })
      .populate("user", "name email")
      .sort({ updatedAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const payments = await Order.find({
      paymentStatus: "verified",
    });

    const totalRevenue = payments.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    const today = new Date();

    const todayRevenue = payments
      .filter((order) => {
        const date = new Date(order.updatedAt);

        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      })
      .reduce((sum, order) => sum + order.totalPrice, 0);

    const monthRevenue = payments
      .filter((order) => {
        const date = new Date(order.updatedAt);

        return (
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      })
      .reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
      verifiedPayments: payments.length,
      totalRevenue,
      todayRevenue,
      monthRevenue,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};