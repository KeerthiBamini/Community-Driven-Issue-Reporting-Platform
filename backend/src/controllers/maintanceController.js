const Issue = require("../models/Issue");


// =====================================================
// 📌 1. GET ASSIGNED ISSUES (Only Maintenance)
// =====================================================

exports.getAssignedIssues = async (req, res) => {
  try {
    const maintenanceId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = {
      assignedTo: maintenanceId,
      isDeleted: false
    };

    const total = await Issue.countDocuments(query);

    const issues = await Issue.find(query)
      .populate("createdBy", "name email")
      .sort({ priorityScore: -1 }) // show most important first
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Assigned issues fetched successfully",
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: issues
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned issues",
      code: "MAINTENANCE_FETCH_ERROR"
    });
  }
};



// =====================================================
// 📌 2. UPDATE ISSUE STATUS (Maintenance Only)
// =====================================================

exports.updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;
    const maintenanceId = req.user.id;

    const allowedTransitions = ["in_progress", "resolved", "closed"];

    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status transition",
        code: "INVALID_STATUS_TRANSITION"
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue || issue.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        code: "ISSUE_NOT_FOUND"
      });
    }

    // 🔒 Ensure issue is assigned to this maintenance staff
    if (!issue.assignedTo || issue.assignedTo.toString() !== maintenanceId) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this issue",
        code: "NOT_ASSIGNED"
      });
    }

    // 🔁 Status Flow Rules
    if (issue.status === "open") {
      return res.status(400).json({
        success: false,
        message: "Admin must first assign the issue",
        code: "INVALID_FLOW"
      });
    }

    if (issue.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "Closed issues cannot be modified",
        code: "ISSUE_CLOSED"
      });
    }

    issue.status = status;
    await issue.save();

    res.status(200).json({
      success: true,
      message: "Issue status updated successfully",
      data: issue
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Status update failed",
      code: "MAINTENANCE_STATUS_ERROR"
    });
  }
};



// =====================================================
// 📌 3. ADD PROGRESS NOTE (Optional Feature)
// =====================================================

exports.addProgressNote = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { note } = req.body;
    const maintenanceId = req.user.id;

    if (!note || note.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Note must be at least 5 characters",
        code: "INVALID_NOTE"
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue || issue.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        code: "ISSUE_NOT_FOUND"
      });
    }

    if (!issue.assignedTo || issue.assignedTo.toString() !== maintenanceId) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this issue",
        code: "NOT_ASSIGNED"
      });
    }

    // If you want notes array in Issue model, add this field:
    // progressNotes: [{ note, addedBy, createdAt }]

    issue.progressNotes = issue.progressNotes || [];

    issue.progressNotes.push({
      note,
      addedBy: maintenanceId,
      createdAt: new Date()
    });

    await issue.save();

    res.status(200).json({
      success: true,
      message: "Progress note added successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add progress note",
      code: "MAINTENANCE_NOTE_ERROR"
    });
  }
};