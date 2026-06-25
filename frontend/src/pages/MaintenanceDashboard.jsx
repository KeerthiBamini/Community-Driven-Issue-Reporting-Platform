import React, { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import Pagination from "../components/Pagination";
import "./MaintenanceDashboard.css";

const MaintenanceDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const isFirstLoadRef = useRef(true);
  const knownIssueIdsRef = useRef(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pushNotification = (message, type = "info") => {
    const item = {
      id: Date.now().toString() + Math.random().toString(16).slice(2),
      message,
      type,
      time: new Date().toLocaleTimeString(),
    };
    setNotifications((prev) => [item, ...prev].slice(0, 5));
  };

  // Fetch assigned issues
  const fetchAssignedIssues = async (page = 1) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `/maintenance/issues?page=${page}`
      );

      const list = res.data.data || [];
      setIssues(list);
      setCurrentPage(res.data.currentPage || 1);
      setTotalPages(res.data.totalPages || 1);

      // Notify only for newly assigned issues for this specific staff.
      const nextIds = new Set(list.map((issue) => issue._id));
      if (isFirstLoadRef.current) {
        knownIssueIdsRef.current = nextIds;
        isFirstLoadRef.current = false;
      } else {
        const newlyAssigned = list.filter((issue) => !knownIssueIdsRef.current.has(issue._id));
        if (newlyAssigned.length > 0) {
          const titles = newlyAssigned.map((issue) => issue.title).slice(0, 2).join(", ");
          pushNotification(
            newlyAssigned.length === 1
              ? `New issue assigned to you: ${titles}`
              : `${newlyAssigned.length} new issues assigned to you: ${titles}${
                  newlyAssigned.length > 2 ? "..." : ""
                }`,
            "info"
          );
        }
        knownIssueIdsRef.current = nextIds;
      }

      if (list.length === 0 && !isFirstLoadRef.current) {
        pushNotification("No active assigned issues right now.", "success");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching assigned issues:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedIssues(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAssignedIssues(currentPage);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentPage]);

  // Update status function
  const updateStatus = async (issueId, status) => {
    try {
      await axios.patch(`/maintenance/issues/${issueId}/status`, {
        status,
      });

      if (status === "resolved") {
        const issue = issues.find((item) => item._id === issueId);
        pushNotification(`Marked as resolved: ${issue?.title || "Issue"}`, "success");
      }

      fetchAssignedIssues(currentPage);
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  return (
    <div className="maintenance-dashboard">
      <h2>Maintenance Dashboard</h2>
      {notifications.length > 0 && (
        <div className="dashboard-notification-panel">
          <div className="dashboard-notification-head">Your Task Alerts</div>
          {notifications.map((item) => (
            <div key={item.id} className={`dashboard-notification-item ${item.type}`}>
              <span className="notify-dot" />
              <div className="notify-content">
                <p>{item.message}</p>
                <small>{item.time}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p>Loading assigned tasks...</p>
      ) : issues.length === 0 ? (
        <p>No assigned issues.</p>
      ) : (
        issues.map((issue) => (
          <div key={issue._id} className="maintenance-card">
            <div className="card-header">
              <h3>{issue.title}</h3>
              <span className={`status ${issue.status}`}>
                {issue.status.replace("_", " ").toUpperCase()}
              </span>
            </div>

            <p className="description">{issue.description}</p>

            <div className="meta">
              <span>Category: {issue.category}</span>
              <span>
                Reported On:{" "}
                {new Date(issue.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="maintenance-actions">
              {issue.status === "open" && (
                <button
                  onClick={() =>
                    updateStatus(issue._id, "in_progress")
                  }
                >
                  Start Work
                </button>
              )}

              {issue.status === "in_progress" && (
                <button
                  onClick={() =>
                    updateStatus(issue._id, "resolved")
                  }
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default MaintenanceDashboard;
