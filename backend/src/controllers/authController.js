const User = require("../models/User");
const Admin = require("../models/Admin");
const MaintenanceStaff = require("../models/MaintenanceStaff");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// =====================================================
// 📌 1. REGISTER USER
// =====================================================
exports.register = async (req, res) => {
  try {
    const { name, email, password, apartmentBlock, flatNumber, role } = req.body;

    console.log("Registration request received:", { name, email, role });

    // Validate role
    const validRoles = ["user", "admin", "maintenance"];
    const userRole = validRoles.includes(role) ? role : "user";

    console.log("Validated role:", userRole);

    // Use separate collections for admin/staff; user collection for residents.
    let existingUser;
    let user;

    if (userRole === "admin") {
      existingUser = await Admin.findOne({ email });
      if (existingUser) {
        console.log("Existing admin detected:", existingUser.email);
        return res.status(400).json({
          success: false,
          message: "Admin already exists",
          code: "USER_ALREADY_EXISTS"
        });
      }
      console.log("Creating new admin...");
      user = await Admin.create({ name, email, password, role: "admin" });
    } else if (userRole === "maintenance") {
      existingUser = await MaintenanceStaff.findOne({ email });
      if (existingUser) {
        console.log("Existing maintenance staff detected:", existingUser.email);
        return res.status(400).json({
          success: false,
          message: "Maintenance staff already exists",
          code: "USER_ALREADY_EXISTS"
        });
      }
      console.log("Creating new maintenance staff...");
      user = await MaintenanceStaff.create({ name, email, password, role: "maintenance" });
    } else {
      existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("Existing user detected:", existingUser.email);
        return res.status(400).json({
          success: false,
          message: "User already exists",
          code: "USER_ALREADY_EXISTS"
        });
      }
      console.log("Creating new user...");
      user = await User.create({
        name,
        email,
        password,
        role: "user",
        apartmentBlock,
        flatNumber
      });
    }

    console.log(`${userRole} created successfully:`, user._id);

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Registration failed",
      code: "REGISTER_ERROR",
      details: error.message
    });
  }
};

// =====================================================
// 📌 2. LOGIN USER
// =====================================================
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let user;

    if (role === "admin") {
      user = await Admin.findOne({ email }).select("+password");
    } else if (role === "maintenance") {
      user = await MaintenanceStaff.findOne({ email }).select("+password");
    } else {
      user = await User.findOne({ email }).select("+password");
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch || (role && user.role !== role)) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Update lastLogin for User model only
    if (user.role === "user") {
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Login failed",
      code: "LOGIN_ERROR"
    });
  }
};

// =====================================================
// 📌 3. GET CURRENT USER PROFILE
// =====================================================
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      code: "PROFILE_ERROR"
    });
  }
};

// =====================================================
// 📌 4. LOGOUT (JWT Stateless)
// =====================================================
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Logout failed",
      code: "LOGOUT_ERROR"
    });
  }
};


