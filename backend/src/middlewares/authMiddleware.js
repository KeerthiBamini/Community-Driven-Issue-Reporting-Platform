const jwt = require("jsonwebtoken");
const User = require("../models/User");


// =====================================================
// 🔐 1. PROTECT MIDDLEWARE
// Verifies JWT and attaches user to req
// =====================================================

exports.protect = async (req, res, next) => {
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

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from DB
    const user = await User.findById(decoded.id).select("-password");

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