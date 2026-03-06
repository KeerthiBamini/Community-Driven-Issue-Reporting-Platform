const express = require("express");
const router = express.Router();

const {
  createIssue,
  getAllIssues,
  getIssueById,   // ✅ correct name
  updateIssue,
  getMyIssues,
  reactToIssue    // ✅ your controller has this
} = require("../controllers/issueController");

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Public routes
router.get("/", getAllIssues);
router.get("/:issueId", getIssueById);

// Protected routes
router.post("/", protect, authorizeRoles("user", "admin"), createIssue);
router.get("/my/issues", protect, getMyIssues);
router.put("/:issueId", protect, updateIssue);

// Reaction (instead of upvote/downvote)
router.post("/:issueId/react", protect, reactToIssue);

module.exports = router;