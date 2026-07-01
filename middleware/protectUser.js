import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided. Please login first." 
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token format" 
      });
    }

    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ 
        success: false,
        message: "Server configuration error" 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ 
          success: false,
          message: "Invalid token" 
        });
      }
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ 
          success: false,
          message: "Token expired. Please login again." 
        });
      }
      throw err;
    }

    // Get user ID from token (handle both 'id' and 'userId' fields)
    const userId = decoded.id || decoded.userId || decoded._id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token payload" 
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ 
      success: false,
      message: "Authentication failed" 
    });
  }
};
  