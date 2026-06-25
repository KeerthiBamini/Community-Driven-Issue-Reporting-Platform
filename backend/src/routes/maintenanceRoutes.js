const express = require("express");
const router = express.Router();

const {
  getAssignedIssues,
  updateIssueStatus
} = require("../controllers/maintanceController");

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// All maintenance routes require authentication and maintenance role
router.use(protect);
router.use(authorizeRoles("maintenance"));

router.get("/issues", getAssignedIssues);
router.patch("/issues/:issueId/status", updateIssueStatus);

module.exports = router;