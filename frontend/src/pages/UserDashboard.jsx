import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import IssueCard from "../components/IssueCard";
import Pagination from "../components/Pagination";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Fetch Issues
  const fetchIssues = async (page = 1) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `/issues?page=${page}&status=${statusFilter}&category=${categoryFilter}`
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

  useEffect(() => {
    fetchIssues(currentPage);
  }, [currentPage, statusFilter, categoryFilter]);

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h2>Community Issues</h2>

        <Link to="/report-issue" className="report-btn">
          + Report New Issue
        </Link>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div>
          <label>Status:</label>
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

        <div>
          <label>Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setCategoryFilter(e.target.value);
            }}
          >
            <option value="all">All</option>
            <option value="maintenance">Maintenance</option>
            <option value="cleanliness">Cleanliness</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="security">Security</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Issue List */}
      {loading ? (
        <p>Loading issues...</p>
      ) : issues.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        issues.map((issue) => (
          <IssueCard
            key={issue._id}
            issue={issue}
            refreshIssues={() => fetchIssues(currentPage)}
          />
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
};

export default UserDashboard;