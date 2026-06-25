import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/user/login");
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
              <Link to="/user/login">Login</Link>
            </li>
            <li>
              <Link to="/user/register">Register</Link>
            </li>
          </>
        )}

        {/* USER DASHBOARD */}
        {user?.role === "user" && (
          <>
            <li>
              <Link to="/user/dashboard">Dashboard</Link>
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
          </>
        )}

        {/* MAINTENANCE STAFF DASHBOARD */}
        {user?.role === "maintenance" && (
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
