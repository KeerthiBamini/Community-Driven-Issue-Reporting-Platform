import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Pagination from "../components/Pagination";
import "./MaintenanceDashboard.css";

const MaintenanceDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch assigned issues
  const fetchAssignedIssues = async (page = 1) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `/issues?assigned=true&page=${page}`
      );

      setIssues(res.data.data.issues);
      setCurrentPage(res.data.data.currentPage);
      setTotalPages(res.data.data.totalPages);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching assigned issues:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedIssues(currentPage);
  }, [currentPage]);

  // Update status function
  const updateStatus = async (issueId, status) => {
    try {
      await axios.put(`/admin/issues/${issueId}/status`, {
        status,
      });

      fetchAssignedIssues(currentPage);
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  return (
    <div className="maintenance-dashboard">
      <h2>Maintenance Dashboard</h2>

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
              {issue.status === "assigned" && (
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