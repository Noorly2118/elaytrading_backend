import "./config/env.js";

import express from "express";
import cors from "cors";

import productRoutes from "./routes/productRoute.js";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/admin.js";
import categoryRoutes from "./routes/Category.js";
import authRoutes from "./routes/authRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import cartRoutes from "./routes/cartRoute.js";
import MyorderRoutes from "./routes/MyOrders.js";
import paymentRoutes from "./routes/paymentRoutes.js"
import adminUserRoutes from "./routes/adminUserRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";





const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TEST EMAIL ENDPOINT - Add this RIGHT NOW!
app.get('/debug-email', async (req, res) => {
  try {
    console.log("🔍 DEBUGGING EMAIL CONFIG:");
    console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✓ SET" : "✗ MISSING");
    console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "✓ SET" : "✗ MISSING");
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "✗ MISSING");
    
    // Try to send a test email
    const { sendVerificationEmail } = await import('./utils/email.js');
    const testCode = '123456';
    
    console.log(`📧 Attempting to send test email to ${process.env.EMAIL_USER}...`);
    await sendVerificationEmail(process.env.EMAIL_USER, 'Debug User', testCode);
    
    res.json({ 
      success: true, 
      message: 'Test email sent! Check your inbox.',
      note: 'Check spam folder if not in inbox'
    });
  } catch (error) {
    console.error('❌ Debug email failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});


// Debug: make sure variables are loaded
console.log('PORT:', process.env.PORT || 'not found (will use 5000)');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'present' : 'MISSING ← this will crash connection');

// Safety check
if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI is not defined in .env file');
  process.exit(1);
}

// ────────────────────────────────────────────────

// Middleware
app.use(cors());
app.use(express.json());

// Root route for testing
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString()
  });
});

// Product routes
app.use('/api/products', productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); 

app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api/cart", cartRoutes);
app.use("/api/myorders", MyorderRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/admin/users", adminUserRoutes);
// ────────────────────────────────────────────────
// Start server + database connection
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:');
    console.error(error.message);
    process.exit(1);
  }
};

// Run the async startup
startServer();