const express = require('express');
const router = express.Router();
// IMPORTANT: Ensure the path to your controller is correct!
const adminController = require('../controllers/adminController');

const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

console.log("🛡️ Admin routes loaded, protect:", typeof protect, "authorizeRoles:", typeof authorizeRoles);

// Check if any function is undefined to prevent the crash
console.log("AdminController Load Check:", !!adminController.getAllIssues);

// All admin routes require authentication and admin role
// router.use(protect);
// router.use(authorizeRoles("admin"));

router.get('/issues', protect, authorizeRoles("admin"), adminController.getAllIssues);
router.post('/assign/:issueId', protect, authorizeRoles("admin"), adminController.assignIssue);
router.patch('/status/:issueId', protect, authorizeRoles("admin"), adminController.updateIssueStatus);
router.delete('/issue/:issueId', protect, authorizeRoles("admin"), adminController.deleteIssue);
router.get('/stats', protect, authorizeRoles("admin"), adminController.getDashboardStats);
router.get('/users', protect, authorizeRoles("admin"), (req, res) => {
  console.log("🎯 Admin users route hit!");
  return adminController.getUsers(req, res);
});
router.post('/staff', protect, authorizeRoles("admin"), adminController.createStaff);
router.put('/staff/:userId', protect, authorizeRoles("admin"), adminController.updateStaff);
router.delete('/staff/:userId', protect, authorizeRoles("admin"), adminController.deleteStaff);

module.exports = router;