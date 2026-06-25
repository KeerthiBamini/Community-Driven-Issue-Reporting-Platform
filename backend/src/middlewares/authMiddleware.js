const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const MaintenanceStaff = require("../models/MaintenanceStaff");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER || "community-issues-api";


// =====================================================
// 🔐 1. PROTECT MIDDLEWARE
// Verifies JWT and attaches user to req
// =====================================================
exports.protect = async (req, res, next) => {
  console.log("🔐 Protect middleware called for:", req.path);
  try {
    let token;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
        code: "TOKEN_MISSING"
      });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server authentication config is missing",
        code: "AUTH_CONFIG_MISSING"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });

    // Find user from DB by role
    let user;
    if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id).select("-password");
    } else if (decoded.role === "maintenance") {
      user = await MaintenanceStaff.findById(decoded.id).select("-password");
    } else {
      user = await User.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
        code: "ACCOUNT_DEACTIVATED"
      });
    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired, please login again",
        code: "TOKEN_EXPIRED"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      code: "TOKEN_INVALID"
    });
  }
};



// =====================================================
// 🔒 2. AUTHORIZE MIDDLEWARE (Role-Based Access)
// Usage: authorize("admin")
//        authorize("admin", "maintenance")
// =====================================================

exports.authorize = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
        code: "UNAUTHORIZED"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
        code: "FORBIDDEN"
      });
    }

    next();
  };
};
