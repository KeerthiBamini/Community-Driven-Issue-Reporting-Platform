import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import IssueCard from "../components/IssueCard";
import Pagination from "../components/Pagination";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const isFirstResolvedLoadRef = useRef(true);
  const knownIssueStatusRef = useRef(new Map());

  const pushNotification = (message, type = "info") => {
    const item = {
      id: Date.now().toString() + Math.random().toString(16).slice(2),
      message,
      type,
      time: new Date().toLocaleTimeString(),
    };
    setNotifications((prev) => [item, ...prev].slice(0, 5));
  };

  // Fetch Issues
  const fetchIssues = async (page = 1) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `/issues?page=${page}&status=${statusFilter}&category=${categoryFilter}`
      );

      setIssues(res.data.data);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching issues:", error);
      setLoading(false);
    }
  };

  const pollMyResolvedNotifications = async () => {
    try {
      const res = await axios.get("/issues/my/issues");
      const myIssues = res.data.data || [];
      const nextMap = new Map(myIssues.map((issue) => [issue._id, issue.status]));

      if (isFirstResolvedLoadRef.current) {
        knownIssueStatusRef.current = nextMap;
        isFirstResolvedLoadRef.current = false;
        return;
      }

      myIssues.forEach((issue) => {
        const prevStatus = knownIssueStatusRef.current.get(issue._id);
        if (!prevStatus || prevStatus === issue.status) return;

        if (issue.status === "in_progress") {
          pushNotification(`Issue in progress: ${issue.title}`, "info");
        }

        if (issue.status === "resolved") {
          pushNotification(`Resolved by staff: ${issue.title}`, "success");
        }
      });

      knownIssueStatusRef.current = nextMap;
    } catch (error) {
      console.error("User notification poll failed:", error);
    }
  };

  useEffect(() => {
    fetchIssues(currentPage);
  }, [currentPage, statusFilter, categoryFilter]);

  useEffect(() => {
    pollMyResolvedNotifications();
    const interval = setInterval(() => {
      pollMyResolvedNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h2>Community Issues</h2>

        <Link to="/report-issue" className="report-btn">
          + Report New Issue
        </Link>
      </div>
      {notifications.length > 0 && (
        <div className="dashboard-notification-panel">
          <div className="dashboard-notification-head">Updates For You</div>
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
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
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
        <div className="loading-text">Loading issues...</div>
      ) : issues.length === 0 ? (
        <div className="no-issues">No issues found. Be the first to report one!</div>
      ) : (
        <div className="issues-grid">
          {issues.map((issue) => (
            <IssueCard
              key={issue._id}
              issue={issue}
              refreshIssues={() => fetchIssues(currentPage)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination-container">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default UserDashboard;
