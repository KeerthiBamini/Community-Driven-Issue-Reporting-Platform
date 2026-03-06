const Issue = require("../models/Issue");
const User = require("../models/User");

// 📌 1. GET ALL ISSUES
exports.getAllIssues = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const query = { isDeleted: false };

    if (status) query.status = status;

    const totalIssues = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email role")
      .sort({ priorityScore: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      total: totalIssues,
      currentPage: page,
      totalPages: Math.ceil(totalIssues / limit),
      data: issues
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch issues" });
  }
};

// 📌 2. ASSIGN ISSUE
exports.assignIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { maintenanceId } = req.body;

    const issue = await Issue.findById(issueId);
    if (!issue || issue.isDeleted) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    const maintenanceUser = await User.findById(maintenanceId);
    if (!maintenanceUser || maintenanceUser.role !== "maintenance") {
      return res.status(400).json({ success: false, message: "Invalid maintenance staff" });
    }

    issue.assignedTo = maintenanceId;
    issue.status = "in_progress";
    await issue.save();

    res.status(200).json({ success: true, message: "Issue assigned successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Assignment failed" });
  }
};

// 📌 3. UPDATE ISSUE STATUS
exports.updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;
    const allowedStatus = ["open", "in_progress", "resolved", "closed"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const issue = await Issue.findById(issueId);
    if (!issue || issue.isDeleted) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    issue.status = status;
    await issue.save();
    res.status(200).json({ success: true, message: "Status updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Status update failed" });
  }
};

// 📌 4. SOFT DELETE ISSUE
exports.deleteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const issue = await Issue.findById(issueId);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

    issue.isDeleted = true;
    await issue.save();
    res.status(200).json({ success: true, message: "Issue deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

// 📌 5. GET DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = {
      totalIssues: await Issue.countDocuments({ isDeleted: false }),
      openIssues: await Issue.countDocuments({ status: "open", isDeleted: false }),
      inProgressIssues: await Issue.countDocuments({ status: "in_progress", isDeleted: false }),
      resolvedIssues: await Issue.countDocuments({ status: "resolved", isDeleted: false }),
      totalUsers: await User.countDocuments({ role: "user" }),
      totalMaintenance: await User.countDocuments({ role: "maintenance" })
    };
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Stats fetch failed" });
  }
};