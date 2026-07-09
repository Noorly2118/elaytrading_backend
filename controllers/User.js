import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { sendVerificationEmail, sendWelcomeEmail } from "../utils/email.js";

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Helper to log email config (useful for debugging)
// Helper to log email config (useful for debugging)
const logEmailConfig = () => {
  console.log("[EMAIL CONFIG]", {
    provider: "resend",
    api_key: process.env.RESEND_API_KEY ? "✓ SET" : "✗ MISSING",
    from: process.env.EMAIL_FROM || "using default (onboarding@resend.dev)",
    frontend_url: process.env.FRONTEND_URL || "✗ MISSING",
  });
};
// ======================
// REGISTER - Step 1: Create unverified user & send code
// ======================
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Resend verification code for unverified user
      const verificationCode = generateVerificationCode();
      const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      existingUser.verificationCode = verificationCode;
      existingUser.verificationExpires = verificationExpires;
      await existingUser.save();

      // Try to send email (non-blocking)
      try {
        logEmailConfig();
        console.log(`[RESEND] Attempting verification email to ${email}`);
        await sendVerificationEmail(email, existingUser.name, verificationCode);
        console.log(`[RESEND] Verification email sent to ${email}`);
      } catch (emailErr) {
        console.error("[RESEND EMAIL FAILED]", emailErr.message);
        console.error(emailErr.stack);
      }

      return res.status(200).json({
        message: "Verification code sent to your email",
        email,
        requiresVerification: true,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one special character" });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

   
  
const user = await User.create({
  name,
  email: email.toLowerCase().trim(),
  password, 
    isVerified: false,
      verificationCode,
      verificationExpires,// plain → schema will hash it
});
    // Try to send verification email (non-blocking)
    try {
      logEmailConfig();
      console.log(`[REGISTER] Attempting verification email to ${email}`);
      await sendVerificationEmail(email, name, verificationCode);
      console.log(`[REGISTER] Verification email sent to ${email}`);
    } catch (emailErr) {
      console.error("[REGISTER EMAIL FAILED]", emailErr.message);
      console.error(emailErr.stack);
      // We continue — registration still succeeds
    }

    res.status(201).json({
      message: "Registration successful! Please check your email for verification code.",
      email,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("[REGISTER ERROR]", error.message);
    console.error(error.stack);
    res.status(500).json({ message: "Registration failed. Please try again later." });
  }
};

// ======================
// VERIFY EMAIL - Step 2: Verify code and activate account
// ======================
export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!user.verificationCode || !user.verificationExpires) {
      return res.status(400).json({
        message: "No verification code found. Please register again.",
        expired: true,
      });
    }

    if (user.verificationExpires < new Date()) {
      return res.status(400).json({
        message: "Verification code expired. Please request a new one.",
        expired: true,
      });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Verify user
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Send welcome email (non-blocking)
    try {
      logEmailConfig();
      console.log(`[WELCOME] Attempting welcome email to ${email}`);
      await sendWelcomeEmail(email, user.name);
      console.log(`[WELCOME] Welcome email sent to ${email}`);
    } catch (emailErr) {
      console.error("[WELCOME EMAIL FAILED]", emailErr.message);
      console.error(emailErr.stack);
    }

    res.json({
      message: "Email verified successfully! You can now login.",
      verified: true,
    });
  } catch (error) {
    console.error("[VERIFY EMAIL ERROR]", error.message);
    console.error(error.stack);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
};

// ======================
// RESEND VERIFICATION CODE
// ======================
export const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationExpires = verificationExpires;
    await user.save();

    // Try to send (non-blocking)
    try {
      logEmailConfig();
      console.log(`[RESEND] Attempting verification email to ${email}`);
      await sendVerificationEmail(email, user.name, verificationCode);
      console.log(`[RESEND] Verification email sent to ${email}`);
    } catch (emailErr) {
      console.error("[RESEND EMAIL FAILED]", emailErr.message);
      console.error(emailErr.stack);
    }

    res.json({
      message: "New verification code sent to your email",
      email,
    });
  } catch (error) {
    console.error("[RESEND CODE ERROR]", error.message);
    console.error(error.stack);
    res.status(500).json({ message: "Failed to resend code. Please try again." });
  }
};

// ======================
// LOGIN - Only allow verified users
// ======================
export const loginUser = async (req, res) => {
 
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!email || !password) {
  return res.status(400).json({ message: "Email and password required" });
}

if (!user || !user.password) {
  return res.status(401).json({ message: "Invalid credentials" });
}

const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) {
  return res.status(401).json({ message: "Invalid credentials" });
}

    if (!user.isVerified) {
      const verificationCode = generateVerificationCode();
      const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

      user.verificationCode = verificationCode;
      user.verificationExpires = verificationExpires;
      await user.save();

      // Try resend verification email (non-blocking)
      try {
        logEmailConfig();
        console.log(`[LOGIN UNVERIFIED] Attempting verification email to ${email}`);
        await sendVerificationEmail(email, user.name, verificationCode);
        console.log(`[LOGIN UNVERIFIED] Verification email sent to ${email}`);
      } catch (emailErr) {
        console.error("[LOGIN EMAIL FAILED]", emailErr.message);
        console.error(emailErr.stack);
      }

      return res.status(403).json({
        message: "Please verify your email first. A new verification code has been sent.",
        email: user.email,
        requiresVerification: true,
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("[LOGIN ERROR]", error.message);
    console.error(error.stack);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

// ======================
// CHECK AUTH STATUS
// ======================
export const checkAuthStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -verificationCode -verificationExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("[CHECK AUTH ERROR]", error.message);
    res.status(500).json({ message: "Failed to get user status" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getUserById = async (req, res) => {
   try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update role" });
  }
};

export const updateUserStatus = async (req, res) => {
   try {
    const { isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update status" });
  }
};

export const deleteUser=async(req,res) =>{
   try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user" });
  }

}