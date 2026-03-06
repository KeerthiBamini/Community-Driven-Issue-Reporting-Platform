const express = require('express');
const router = express.Router();
const { register, login, getProfile, logout } = require('../controllers/authController');

// Optional: JWT auth middleware (protect route)
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

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