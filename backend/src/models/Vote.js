const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    // 🔗 Reference to the Issue being reacted to
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "Issue reference is required"],
      index: true
    },

    // 👤 Reference to the User who reacted
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true
    },

    // 👍👎 Type of reaction
    voteType: {
      type: String,
      enum: {
        values: ["upvote", "downvote"],
        message: "Vote type must be either 'upvote' or 'downvote'"
      },
      required: [true, "Vote type is required"]
    },

    // 🧠 Optional future-proof field (can extend later)
    // Example: helpful, important, etc.
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // createdAt & updatedAt
  }
);



// =====================================================
// 🔒 UNIQUE CONSTRAINT
// Prevents duplicate reaction per user per issue
// =====================================================

voteSchema.index(
  { issue: 1, user: 1 },
  { unique: true }
);



// =====================================================
// ⚡ ADDITIONAL PERFORMANCE INDEXES
// =====================================================

// Fast lookup of votes by issue
voteSchema.index({ issue: 1 });

// Fast lookup of votes by user
voteSchema.index({ user: 1 });



// =====================================================
// 🧾 OPTIONAL INSTANCE METHOD (Readable Label)
// =====================================================

voteSchema.methods.isUpvote = function () {
  return this.voteType === "upvote";
};

voteSchema.methods.isDownvote = function () {
  return this.voteType === "downvote";
};



// =====================================================
// 🚀 EXPORT MODEL
// =====================================================

module.exports = mongoose.model("Vote", voteSchema);