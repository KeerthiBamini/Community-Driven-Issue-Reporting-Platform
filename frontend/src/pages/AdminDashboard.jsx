import React, { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import Pagination from "../components/Pagination";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStaffByIssue, setSelectedStaffByIssue] = useState({});

  const [analytics, setAnalytics] = useState({
    totalIssues: 0,
    reported: 0,
    in_progress: 0,
    resolved: 0,
  });

  const [maintenanceUsers, setMaintenanceUsers] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const isFirstResolvedLoadRef = useRef(true);
  const knownResolvedIdsRef = useRef(new Set());
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "maintenance",
    phone: "",
  });

  const pushNotification = (message, type = "info") => {
    const item = {
      id: Date.now().toString() + Math.random().toString(16).slice(2),
      message,
      type,
      time: new Date().toLocaleTimeString(),
    };
    setNotifications((prev) => [item, ...prev].slice(0, 5));
  };

  const fetchIssues = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/admin/issues?page=${page}&severity=${severityFilter}&status=${statusFilter}`
      );
      setIssues(res.data.data || []);
      setCurrentPage(res.data.currentPage || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("/admin/stats");
      setAnalytics(res.data.data || analytics);
    } catch (error) {
      console.error("Analytics error:", error);
    }
  };

  const fetchMaintenanceUsers = async () => {
    try {
      const res = await axios.get("/admin/users?role=maintenance");
      const activeMaintenance = (res.data.data || []).filter(
        (user) => user.isActive !== false
      );
      setMaintenanceUsers(activeMaintenance);
    } catch (error) {
      console.error("Fetch maintenance users error:", error);
    }
  };

  const fetchAllStaff = async () => {
    try {
      const [adminsRes, maintenanceRes] = await Promise.all([
        axios.get("/admin/users?role=admin"),
        axios.get("/admin/users?role=maintenance"),
      ]);

      const admins = adminsRes.data.data || [];
      const maintenance = maintenanceRes.data.data || [];
      setAllStaff([...admins, ...maintenance]);
    } catch (error) {
      console.error("Fetch all staff error:", error);
    }
  };

  const updateStatus = async (issueId, status) => {
    try {
      await axios.patch(`/admin/status/${issueId}`, { status });
      fetchIssues(currentPage);
      fetchAnalytics();
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const pollResolvedByMaintenance = async () => {
    try {
      const res = await axios.get("/admin/issues?page=1&limit=100&status=resolved");
      const resolved = (res.data.data || []).filter(
        (issue) => issue.resolvedByModel === "MaintenanceStaff"
      );

      const nextIds = new Set(resolved.map((issue) => issue._id));
      if (isFirstResolvedLoadRef.current) {
        knownResolvedIdsRef.current = nextIds;
        isFirstResolvedLoadRef.current = false;
        return;
      }

      const newResolved = resolved.filter(
        (issue) => !knownResolvedIdsRef.current.has(issue._id)
      );

      if (newResolved.length > 0) {
        const title = newResolved[0]?.title || "an issue";
        pushNotification(
          newResolved.length === 1
            ? `Maintenance resolved: ${title}`
            : `${newResolved.length} issues were resolved by maintenance staff.`,
          "success"
        );
      }

      knownResolvedIdsRef.current = nextIds;
    } catch (error) {
      console.error("Resolved notification poll failed:", error);
    }
  };

  const assignIssue = async (issueId) => {
    const staffId = selectedStaffByIssue[issueId];
    if (!staffId) {
      alert("Please select a maintenance staff member first.");
      return;
    }

    try {
      await axios.post(`/admin/assign/${issueId}`, { maintenanceId: staffId });
      const selectedStaff = maintenanceUsers.find((user) => user._id === staffId);
      const assignedIssue = issues.find((issue) => issue._id === issueId);
      fetchIssues(currentPage);
      fetchAnalytics();
      fetchMaintenanceUsers();
      setSelectedStaffByIssue((prev) => ({ ...prev, [issueId]: "" }));
      pushNotification(
        `Assigned "${assignedIssue?.title || "Issue"}" to ${selectedStaff?.name || "staff"}.`,
        "info"
      );
    } catch (error) {
      console.error("Assign failed:", error);
      alert(error.response?.data?.message || "Issue assignment failed");
    }
  };

  const openIssueDetails = (issue) => {
    setSelectedIssue(issue);
  };

  const closeIssueDetails = () => {
    setSelectedIssue(null);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/admin/staff", staffForm);
      setStaffForm({
        name: "",
        email: "",
        password: "",
        role: "maintenance",
        phone: "",
      });
      setShowStaffModal(false);
      fetchAllStaff();
      fetchMaintenanceUsers();
      pushNotification(`New staff created: ${staffForm.name}`, "success");
    } catch (error) {
      console.error("Create staff failed:", error);
      alert(error.response?.data?.message || "Failed to create staff member");
    }
  };

  const handleDeleteStaff = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this staff member?")) {
      return;
    }

    try {
      await axios.delete(`/admin/staff/${userId}`);
      fetchAllStaff();
      fetchMaintenanceUsers();
      pushNotification("Staff member deactivated successfully.", "info");
    } catch (error) {
      console.error("Delete staff failed:", error);
      alert(error.response?.data?.message || "Failed to delete staff member");
    }
  };

  useEffect(() => {
    fetchIssues(currentPage);
  }, [currentPage, statusFilter, severityFilter]);

  useEffect(() => {
    fetchAnalytics();
    fetchMaintenanceUsers();
    fetchAllStaff();
    pollResolvedByMaintenance();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMaintenanceUsers();
      fetchAllStaff();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      pollResolvedByMaintenance();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="dashboard-top-grid">
        <div className="dashboard-summary-column">
          {notifications.length > 0 && (
            <div className="dashboard-notification-panel">
              <div className="dashboard-notification-head">Recent Notifications</div>
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
        </div>

        <div className="staff-management-section">
          <div className="staff-header">
            <h3>Staff Management</h3>
            <button className="btn-add-staff" onClick={() => setShowStaffModal(true)}>
              + Add Staff
            </button>
          </div>
          <p className="staff-section-note">
            Staff list has been hidden for a cleaner admin view. Use the button above to add new staff members.
          </p>
        </div>
      </div>

      <div className="filter-section">
        <label>Status Filter:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setCurrentPage(1);
            setStatusFilter(e.target.value);
          }}
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <label style={{ marginLeft: "12px" }}>Severity Filter:</label>
        <select
          value={severityFilter}
          onChange={(e) => {
            setCurrentPage(1);
            setSeverityFilter(e.target.value);
          }}
        >
          <option value="all">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-message">Loading issues...</p>
      ) : issues.length === 0 ? (
        <p className="no-issues-message">No issues found.</p>
      ) : (
        <div className="admin-issues-grid">
          {issues.map((issue) => (
            <div key={issue._id} className="admin-issue-card">
              <div className="admin-issue-header simple-header">
                <h3>{issue.title}</h3>
              </div>

              <div className="admin-issue-content compact-content">
                <p className="issue-description">
                  {issue.description.length > 180
                    ? issue.description.substring(0, 180) + "..."
                    : issue.description}
                </p>
              </div>

              <div className="admin-issue-actions-card">
                <div className="assign-controls-card">
                  <select
                    className="staff-select"
                    value={selectedStaffByIssue[issue._id] || ""}
                    onChange={(e) =>
                      setSelectedStaffByIssue((prev) => ({
                        ...prev,
                        [issue._id]: e.target.value,
                      }))
                    }
                  >
                    <option value="">Assign Maintenance</option>
                    {maintenanceUsers.length === 0 ? (
                      <option value="" disabled>
                        No active maintenance staff
                      </option>
                    ) : (
                      maintenanceUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))
                    )}
                  </select>
                  <button
                    className="btn-assign"
                    onClick={() => assignIssue(issue._id)}
                  >
                    Assign
                  </button>
                </div>

                <div className="issue-action-buttons">
                  {issue.status !== "resolved" && issue.status !== "closed" && (
                    <button
                      className="btn-resolve"
                      onClick={() => updateStatus(issue._id, "resolved")}
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    className="btn-view-details"
                    onClick={() => openIssueDetails(issue)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {selectedIssue && (
        <div className="modal-overlay" onClick={closeIssueDetails}>
          <div className="modal-content modal-details" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Issue Details</h3>
              <button className="modal-close" onClick={closeIssueDetails}>
                X
              </button>
            </div>
            <div className="issue-detail-panel">
              <div className="issue-detail-row">
                <div>
                  <p className="detail-label">Title</p>
                  <h4>{selectedIssue.title}</h4>
                </div>
                <div>
                  <p className="detail-label">Status</p>
                  <span className={`status-badge status-${selectedIssue.status}`}>
                    {selectedIssue.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <p className="detail-label">Description</p>
                <p className="detail-text">{selectedIssue.description}</p>
              </div>

              <div className="detail-grid">
                <div className="detail-card">
                  <p className="detail-label">Category</p>
                  <p>{selectedIssue.category}</p>
                </div>
                <div className="detail-card">
                  <p className="detail-label">Severity</p>
                  <p>{selectedIssue.severity}</p>
                </div>
                <div className="detail-card">
                  <p className="detail-label">Priority Score</p>
                  <p>{selectedIssue.priorityScore || 0}</p>
                </div>
                <div className="detail-card">
                  <p className="detail-label">Reported</p>
                  <p>{new Date(selectedIssue.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="detail-card">
                  <p className="detail-label">Assigned To</p>
                  <p>{selectedIssue.assignedTo?.name || "Unassigned"}</p>
                </div>
                <div className="detail-card">
                  <p className="detail-label">Resolved On</p>
                  <p>
                    {selectedIssue.resolvedAt
                      ? new Date(selectedIssue.resolvedAt).toLocaleDateString()
                      : "Not resolved yet"}
                  </p>
                </div>
              </div>

              {selectedIssue.location && (
                <div className="detail-section">
                  <p className="detail-label">Location</p>
                  <p>
                    Block {selectedIssue.location.block}
                    {selectedIssue.location.floor ? `, Floor ${selectedIssue.location.floor}` : ""}
                    {selectedIssue.location.flatNumber ? `, Flat ${selectedIssue.location.flatNumber}` : ""}
                  </p>
                </div>
              )}

              {selectedIssue.createdBy && (
                <div className="detail-section">
                  <p className="detail-label">Reported By</p>
                  <p>{selectedIssue.createdBy.name || selectedIssue.createdBy.email}</p>
                </div>
              )}

              {selectedIssue.images && selectedIssue.images.length > 0 && (
                <div className="detail-section">
                  <p className="detail-label">Attachments</p>
                  <div className="issue-images-grid detail-images-grid">
                    {selectedIssue.images.map((image, idx) => (
                      <div key={idx} className="issue-image">
                        <img src={`http://localhost:5000${image}`} alt={`Issue ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section assign-section-modal">
                <p className="detail-label">Actions</p>
                <div className="assign-modal-controls">
                  <select
                    value={selectedStaffByIssue[selectedIssue._id] || ""}
                    onChange={(e) =>
                      setSelectedStaffByIssue((prev) => ({
                        ...prev,
                        [selectedIssue._id]: e.target.value,
                      }))
                    }
                  >
                    <option value="">Assign staff member</option>
                    {maintenanceUsers.length === 0 ? (
                      <option value="" disabled>
                        No active maintenance staff
                      </option>
                    ) : (
                      maintenanceUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))
                    )}
                  </select>
                  <button
                    type="button"
                    className="btn-assign-modal"
                    onClick={() => assignIssue(selectedIssue._id)}
                  >
                    Assign
                  </button>
                  {selectedIssue.status !== "resolved" && selectedIssue.status !== "closed" && (
                    <button
                      type="button"
                      className="btn-resolve-modal"
                      onClick={() => {
                        updateStatus(selectedIssue._id, "resolved");
                        closeIssueDetails();
                      }}
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStaffModal && (
        <div className="modal-overlay" onClick={() => setShowStaffModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Staff Member</h3>
              <button className="modal-close" onClick={() => setShowStaffModal(false)}>
                X
              </button>
            </div>
            <form onSubmit={handleCreateStaff} className="staff-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  required
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowStaffModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
