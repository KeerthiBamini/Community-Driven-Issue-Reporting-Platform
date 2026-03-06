import React, { useContext } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./IssueCard.css";

const IssueCard = ({ issue, refreshIssues }) => {
  const { user } = useContext(AuthContext);

  const {
    _id,
    title,
    description,
    category,
    status,
    priorityScore,
    createdAt,
    voteCount,
  } = issue;

  // Handle Voting
  const handleVote = async (voteType) => {
    try {
      await axios.post("/votes", {
        issueId: _id,
        voteType,
      });

      if (refreshIssues) refreshIssues();
    } catch (error) {
      console.error("Voting failed:", error.response?.data || error.message);
    }
  };

  // Status Color Mapping
  const getStatusClass = (status) => {
    switch (status) {
      case "reported":
        return "status-reported";
      case "assigned":
        return "status-assigned";
      case "in_progress":
        return "status-progress";
      case "resolved":
        return "status-resolved";
      default:
        return "";
    }
  };

  return (
    <div className="issue-card">
      {/* Header */}
      <div className="issue-card-header">
        <h3>{title}</h3>
        <span className={`status-badge ${getStatusClass(status)}`}>
          {status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {/* Body */}
      <div className="issue-card-body">
        <p className="issue-description">
          {description.length > 120
            ? description.substring(0, 120) + "..."
            : description}
        </p>

        <div className="issue-meta">
          <span className="category-tag">{category}</span>
          <span className="priority-score">
            🔥 Priority: {priorityScore || 0}
          </span>
        </div>

        <div className="issue-date">
          Reported on: {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Footer */}
      <div className="issue-card-footer">
        {/* Voting Section - Only Members */}
        {user?.role === "member" && (
          <div className="vote-section">
            <button
              className="vote-btn upvote"
              onClick={() => handleVote("upvote")}
            >
              👍
            </button>

            <span className="vote-count">{voteCount || 0}</span>

            <button
              className="vote-btn downvote"
              onClick={() => handleVote("downvote")}
            >
              👎
            </button>
          </div>
        )}

        {/* View Details */}
        <Link to={`/issues/${_id}`} className="view-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default IssueCard;