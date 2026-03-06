const express = require('express');
const router = express.Router();
// IMPORTANT: Ensure the path to your controller is correct!
const adminController = require('../controllers/adminController');

// Check if any function is undefined to prevent the crash
console.log("AdminController Load Check:", !!adminController.getAllIssues);

router.get('/issues', adminController.getAllIssues);
router.post('/assign/:issueId', adminController.assignIssue);
router.patch('/status/:issueId', adminController.updateIssueStatus);
router.delete('/issue/:issueId', adminController.deleteIssue);
router.get('/stats', adminController.getDashboardStats); // Line 42 check!

module.exports = router;