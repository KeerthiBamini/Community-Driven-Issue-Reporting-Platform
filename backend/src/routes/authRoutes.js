const express = require('express');
const router = express.Router();
const { register, login, getProfile, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// -------------------------------
// Auth Routes
// -------------------------------

// Register user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user profile (protected route)
router.get('/profile', protect, getProfile);

// Logout user
router.post('/logout', logout);

module.exports = router;
