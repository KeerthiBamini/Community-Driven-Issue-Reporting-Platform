import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import IssueCard from "../components/IssueCard";
import Pagination from "../components/Pagination";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState("all");

  const [analytics, setAnalytics] = useState({
    totalIssues: 0,
    reported: 0,
    in_progress: 0,
    resolved: 0,
  });

  // Fetch Issues
  const fetchIssues = async (page = 1) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `/issues?page=${page}&status=${statusFilter}`
      );

      setIssues(res.data.data.issues);
      setCurrentPage(res.data.data.currentPage);
      setTotalPages(res.data.data.totalPages);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching issues:", error);
      setLoading(false);
    }
  };

  // Fetch Analytics
  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("/admin/dashboard");

      setAnalytics(res.data.data);
    } catch (error) {
      console.error("Analytics error:", error);
    }
  };

  useEffect(() => {
    fetchIssues(currentPage);
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {/* Analytics Cards */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>Total Issues</h4>
          <p>{analytics.totalIssues}</p>
        </div>

        <div className="analytics-card reported">
          <h4>Reported</h4>
          <p>{analytics.reported}</p>
        </div>

        <div className="analytics-card progress">
          <h4>In Progress</h4>
          <p>{analytics.in_progress}</p>
        </div>

        <div className="analytics-card resolved">
          <h4>Resolved</h4>
          <p>{analytics.resolved}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <label>Status Filter:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setCurrentPage(1);
            setStatusFilter(e.target.value);
          }}
        >
          <option value="all">All</option>
          <option value="reported">Reported</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Issue List */}
      {loading ? (
        <p>Loading issues...</p>
      ) : issues.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        issues.map((issue) => (
          <div key={issue._id} className="admin-issue-wrapper">
            <IssueCard issue={issue} refreshIssues={fetchIssues} />

            <div className="admin-actions">
              <button
                onClick={() => updateStatus(issue._id, "assigned")}
              >
                Assign
              </button>

              <button
                onClick={() => updateStatus(issue._id, "in_progress")}
              >
                Start Progress
              </button>

              <button
                onClick={() => updateStatus(issue._id, "resolved")}
              >
                Mark Resolved
              </button>
            </div>
          </div>
        ))
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );

  // Update Status Function
  async function updateStatus(issueId, status) {
    try {
      await axios.put(`/admin/issues/${issueId}/status`, { status });

      fetchIssues(currentPage);
      fetchAnalytics();
    } catch (error) {
      console.error("Status update failed:", error);
    }
  }
};

export default AdminDashboard;