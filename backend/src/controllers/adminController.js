const Issue = require("../models/Issue");
const User = require("../models/User");
const MaintenanceStaff = require("../models/MaintenanceStaff");
const Admin = require("../models/Admin");

// 📌 1. GET ALL ISSUES
exports.getAllIssues = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const severity = req.query.severity;
    const query = { isDeleted: false };

    if (status && status !== "all") query.status = status;
    if (severity && severity !== "all") query.severity = severity;

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

    const maintenanceUser = await MaintenanceStaff.findById(maintenanceId);
    if (!maintenanceUser || !maintenanceUser.isActive) {
      return res.status(400).json({ success: false, message: "Invalid maintenance staff" });
    }

    issue.assignedTo = maintenanceId;
    issue.assignedToModel = "MaintenanceStaff";
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
    const adminId = req.user?._id || req.user?.id;
    const allowedStatus = ["open", "in_progress", "resolved", "closed"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const issue = await Issue.findById(issueId);
    if (!issue || issue.isDeleted) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    issue.status = status;
    if (status === "resolved") {
      issue.resolvedBy = adminId || null;
      issue.resolvedByModel = "Admin";
      issue.resolvedAt = new Date();
    }

    if (status !== "resolved") {
      issue.resolvedBy = null;
      issue.resolvedByModel = null;
      issue.resolvedAt = null;
    }

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

// 📌 6. GET USERS BY ROLE
exports.getUsers = async (req, res) => {
  console.log("🔍 getUsers called, user:", req.user);
  try {
    const { role } = req.query;

    if (role === "maintenance") {
      const staff = await MaintenanceStaff.find({ isActive: true }).select("name email role phone isActive");
      return res.status(200).json({ success: true, data: staff });
    }

    if (role === "admin") {
      const admins = await Admin.find({ isActive: true }).select("name email role phone isActive");
      return res.status(200).json({ success: true, data: admins });
    }

    // All users (including admin/maintenance if you want)
    const users = await User.find({ role: "user" }).select("name email role phone isActive");

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// 📌 7. GET DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = {
      totalIssues: await Issue.countDocuments({ isDeleted: false }),
      reported: await Issue.countDocuments({ status: "open", isDeleted: false }),
      in_progress: await Issue.countDocuments({ status: "in_progress", isDeleted: false }),
      resolved: await Issue.countDocuments({ status: "resolved", isDeleted: false }),
    };
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Stats fetch failed" });
  }
};

// 📌 8. CREATE STAFF (Admin/Maintenance)
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validate role
    if (!["admin", "maintenance"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'admin' or 'maintenance'"
      });
    }

    // Check in appropriate collection
    let existingUser;
    if (role === "admin") {
      existingUser = await Admin.findOne({ email });
    } else {
      existingUser = await MaintenanceStaff.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Create staff directly in role-specific collection
    let staff;
    if (role === "admin") {
      staff = await Admin.create({ name, email, password, role, phone });
    } else {
      staff = await MaintenanceStaff.create({ name, email, password, role, phone });
    }

    res.status(201).json({
      success: true,
      message: `${role} staff created successfully`,
      data: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        phone: staff.phone
      }
    });

  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create staff member"
    });
  }
};

// 📌 9. UPDATE STAFF
exports.updateStaff = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, isActive } = req.body;

    let staff = await Admin.findById(userId);
    if (!staff) {
      staff = await MaintenanceStaff.findById(userId);
    }

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found"
      });
    }

    // Only allow updating admin/maintenance staff
    if (!["admin", "maintenance"].includes(staff.role)) {
      return res.status(400).json({
        success: false,
        message: "Can only update admin or maintenance staff"
      });
    }

    // Update fields
    if (name) staff.name = name;
    if (email) staff.email = email;
    if (phone !== undefined) staff.phone = phone;
    if (isActive !== undefined) staff.isActive = isActive;

    await staff.save();

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        phone: staff.phone,
        isActive: staff.isActive
      }
    });

  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update staff member"
    });
  }
};

// 📌 10. DELETE STAFF
exports.deleteStaff = async (req, res) => {
  try {
    const { userId } = req.params;

    let staff = await Admin.findById(userId);
    if (!staff) {
      staff = await MaintenanceStaff.findById(userId);
    }

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found"
      });
    }

    // Only allow deleting admin/maintenance staff
    if (!["admin", "maintenance"].includes(staff.role)) {
      return res.status(400).json({
        success: false,
        message: "Can only delete admin or maintenance staff"
      });
    }

    // Soft delete by deactivating
    staff.isActive = false;
    await staff.save();

    res.status(200).json({
      success: true,
      message: "Staff member deactivated successfully"
    });

  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete staff member"
    });
  }
};
