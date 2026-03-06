import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-logo">
        <Link to="/">Community Issues</Link>
      </div>

      <ul className="navbar-links">
        {/* If NOT Logged In */}
        {!user && (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}

        {/* MEMBER DASHBOARD */}
        {user?.role === "member" && (
          <>
            <li>
              <Link to="/member/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/report-issue">Report Issue</Link>
            </li>
          </>
        )}

        {/* ADMIN DASHBOARD */}
        {user?.role === "admin" && (
          <>
            <li>
              <Link to="/admin/dashboard">Admin Dashboard</Link>
            </li>
            <li>
              <Link to="/admin/issues">Manage Issues</Link>
            </li>
          </>
        )}

        {/* MAINTENANCE STAFF DASHBOARD */}
        {user?.role === "staff" && (
          <>
            <li>
              <Link to="/maintenance/dashboard">My Tasks</Link>
            </li>
          </>
        )}

        {/* If Logged In */}
        {user && (
          <>
            <li className="navbar-user">
              👤 {user.name}
            </li>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;