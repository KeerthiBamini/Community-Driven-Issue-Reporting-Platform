const mongoose = require("mongoose");
const calculatePriority = require("../utils/priorityCalculator");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Issue title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"]
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"]
    },

    category: {
      type: String,
      enum: [
        "plumbing",
        "electricity",
        "cleanliness",
        "security",
        "maintenance",
        "other"
      ],
      required: true
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },

    images: [
      {
        type: String  // Cloudinary image URLs
      }
    ],

    location: {
      block: {
        type: String,
        required: true
      },
      floor: {
        type: String
      },
      flatNumber: {
        type: String
      }
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "assignedToModel"
    },

    assignedToModel: {
      type: String,
      enum: ["User", "MaintenanceStaff", "Admin"],
      default: "User"
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open"
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "resolvedByModel",
      default: null
    },

    resolvedByModel: {
      type: String,
      enum: ["User", "MaintenanceStaff", "Admin"],
      default: null
    },

    resolvedAt: {
      type: Date,
      default: null
    },

    votesCount: {
      type: Number,
      default: 0
    },

    upvotesCount: {
      type: Number,
      default: 0
    },

    downvotesCount: {
      type: Number,
      default: 0
    },

    voters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    priorityScore: {
      type: Number,
      default: 0
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);



// ===============================
// 🔥 PRIORITY CALCULATION LOGIC
// ===============================

// Example logic:
// priorityScore = votesCount * severityWeight

issueSchema.methods.calculatePriority = function () {
  const severityToLevel = {
    low: 1,
    medium: 2,
    high: 4,
    critical: 5
  };

  const urgencyToLevel = {
    open: 3,
    in_progress: 4,
    resolved: 1,
    closed: 1
  };

  const { score } = calculatePriority({
    criticalLevel: severityToLevel[this.severity] || 1,
    upvotes: this.upvotesCount || 0,
    urgencyLevel: urgencyToLevel[this.status] || 1,
    createdAt: this.createdAt,
    status: this.status
  });

  this.priorityScore = score;
};

issueSchema.pre("save", function (next) {
  this.calculatePriority();
  next();
});



// ===============================
// ⚡ PERFORMANCE INDEXES
// ===============================

issueSchema.index({ status: 1 });
issueSchema.index({ severity: 1 });
issueSchema.index({ priorityScore: -1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ createdBy: 1 });



module.exports = mongoose.model("Issue", issueSchema);
