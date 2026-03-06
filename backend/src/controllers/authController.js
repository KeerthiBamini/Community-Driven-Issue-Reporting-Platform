const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================================================
// 🔐 Helper: Generate JWT Token
// =====================================================
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// =====================================================
// 📌 1. REGISTER USER
// =====================================================
exports.register = async (req, res) => {
  try {
    const { name, email, password, apartmentBlock, flatNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
        code: "USER_ALREADY_EXISTS"
      });
    }

    // Create user (role always "user")
    const user = await User.create({
      name,
      email,
      password,
      role: "user",
      apartmentBlock,
      flatNumber
    });

    const token = generateToken(user);

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
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
      code: "REGISTER_ERROR"
    });
  }
};

// =====================================================
// 📌 2. LOGIN USER
// =====================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS"
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

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
    const user = await User.findById(req.user.id).select("-password");

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