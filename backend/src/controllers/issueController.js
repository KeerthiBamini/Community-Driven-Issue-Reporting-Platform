const Issue = require("../models/Issue");
const Vote = require("../models/Vote");

// centralized error handler
const handleError = (res, error, codeKey, defaultMsg) => {
    console.error(error);
    const isProd = process.env.NODE_ENV === "production";
    res.status(500).json({
        success: false,
        message: isProd ? defaultMsg : (error.message || defaultMsg),
        code: codeKey,
        ...(isProd ? {} : { error: error.stack })
    });
};

const parseLocationInput = (location) => {
  if (!location) return undefined;

  if (typeof location === "string") {
    try {
      return JSON.parse(location);
    } catch (error) {
      return { block: location };
    }
  }

  return location;
};

const canManageIssue = (issue, user) => {
  if (!user) return false;
  return issue.createdBy.toString() === user.id || user.role === "admin";
};

// =====================================================
// 📌 1. CREATE ISSUE
// =====================================================

exports.createIssue = async (req, res) => {
  try {
    const { title, description, category, severity, location } = req.body;

    const parsedLocation = parseLocationInput(location);

    // Handle images
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const issue = await Issue.create({
      title,
      description,
      category,
      severity,
      location: parsedLocation,
      images,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue
    });

  } catch (error) {
    handleError(res, error, "CREATE_ISSUE_ERROR", "Issue creation failed");
  }
};



// 📌 2. GET ALL ISSUES (Public / User View)
// =====================================================

exports.getAllIssues = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let query = { isDeleted: false };

    // By default, user dashboard should show only active reported issues.
    query.status = { $nin: ["resolved", "closed"] };

    // Filters
    const { status, category } = req.query;
    if (status && status !== "all") query.status = status;
    if (category && category !== "all") query.category = category;

    // If assigned=true, filter by assigned to current user
    if (req.query.assigned === "true" && req.user) {
      query.assignedTo = req.user.id;
    }

    const total = await Issue.countDocuments(query);

    const issues = await Issue.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Issues fetched successfully",
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: issues
    });

  } catch (error) {
    handleError(res, error, "FETCH_ISSUES_ERROR", "Failed to fetch issues");
  }
};



// =====================================================
// 📌 3. GET SINGLE ISSUE
// =====================================================

exports.getIssueById = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name role");

    if (!issue || issue.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        code: "ISSUE_NOT_FOUND"
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue fetched successfully",
      data: issue
    });

  } catch (error) {
    handleError(res, error, "FETCH_SINGLE_ERROR", "Error fetching issue");
  }
};



// =====================================================
// 📌 4. REACT TO ISSUE (Upvote / Downvote)
// =====================================================

exports.reactToIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { voteType } = req.body; // upvote / downvote
    const userId = req.user.id;

    if (!["upvote", "downvote"].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vote type",
        code: "INVALID_VOTE_TYPE"
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        code: "ISSUE_NOT_FOUND"
      });
    }

    let existingVote = await Vote.findOne({ issue: issueId, user: userId });

    if (!existingVote) {
      // First vote
      await Vote.create({ issue: issueId, user: userId, voteType });

      if (voteType === "upvote") issue.upvotesCount++;
      else issue.downvotesCount++;

    } else if (existingVote.voteType !== voteType) {
      // Change vote
      if (voteType === "upvote") {
        issue.upvotesCount++;
        issue.downvotesCount--;
      } else {
        issue.downvotesCount++;
        issue.upvotesCount--;
      }

      existingVote.voteType = voteType;
      await existingVote.save();

    } else {
      return res.status(400).json({
        success: false,
        message: "You already reacted with this type",
        code: "DUPLICATE_REACTION"
      });
    }

    issue.calculatePriority();
    await issue.save();

    res.status(200).json({
      success: true,
      message: "Reaction recorded successfully"
    });

  } catch (error) {
    handleError(res, error, "REACTION_ERROR", "Reaction failed");
  }
};



// =====================================================
// 📌 5. UPDATE ISSUE (Only Owner)
// =====================================================

exports.updateIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { title, description, category, severity, location } = req.body;

    const issue = await Issue.findById(issueId);

    if (!issue || issue.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        code: "ISSUE_NOT_FOUND"
      });
    }

    if (!canManageIssue(issue, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this issue",
        code: "UNAUTHORIZED"
      });
    }

    if (title) issue.title = title;
    if (description) issue.description = description;
    if (category) issue.category = category;
    if (severity) issue.severity = severity;
    const parsedLocation = parseLocationInput(location);
    if (parsedLocation) issue.location = parsedLocation;
    if (req.files?.length) {
      issue.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    issue.calculatePriority();
    await issue.save();

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: issue
    });

  } catch (error) {
    handleError(res, error, "UPDATE_ISSUE_ERROR", "Update failed");
  }
};



// =====================================================
// 📌 6. GET MY ISSUES
// =====================================================

exports.deleteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);

    if (!issue || issue.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        code: "ISSUE_NOT_FOUND"
      });
    }

    if (!canManageIssue(issue, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this issue",
        code: "UNAUTHORIZED"
      });
    }

    issue.isDeleted = true;
    await issue.save();

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });

  } catch (error) {
    handleError(res, error, "DELETE_ISSUE_ERROR", "Delete failed");
  }
};



exports.getMyIssues = async (req, res) => {
  try {
    const userId = req.user.id;

    const issues = await Issue.find({
      createdBy: userId,
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Your issues fetched successfully",
      data: issues
    });

  } catch (error) {
    handleError(res, error, "FETCH_MY_ISSUES_ERROR", "Failed to fetch your issues");
  }
};
