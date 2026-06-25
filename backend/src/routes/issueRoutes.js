const express = require("express");
const router = express.Router();
const upload = require("../config/multer");

const {
  createIssue,
  getAllIssues,
  getIssueById,   // ✅ correct name
  updateIssue,
  deleteIssue,
  getMyIssues,
  reactToIssue    // ✅ your controller has this
} = require("../controllers/issueController");

const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

// Public routes
router.get("/", getAllIssues);

// Protected routes
router.post("/", protect, authorizeRoles("user", "admin"), upload.array("images", 5), createIssue);
router.get("/my/issues", protect, getMyIssues);
router.put("/:issueId", protect, upload.array("images", 5), updateIssue);
router.delete("/:issueId", protect, deleteIssue);

// Reaction (instead of upvote/downvote)
router.post("/:issueId/react", protect, reactToIssue);
router.get("/:issueId", getIssueById);

module.exports = router;
