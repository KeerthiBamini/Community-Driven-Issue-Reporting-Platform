import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role, action) => {
    const path = action === "login" ? `/${role}/login` : `/${role}/register`;
    navigate(path);
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Smart Community Maintenance</span>
          <h1>Streamline issue reporting, assignment, and resolution.</h1>
          <p>
            Empower residents, administrators, and maintenance staff with a clear, modern platform for faster issue tracking, status updates, and response coordination.
          </p>
          <div className="hero-actions">
            <button onClick={() => handleRoleSelect("user", "login")} className="btn-primary">
              Report an Issue
            </button>
            <button onClick={() => handleRoleSelect("admin", "login")} className="btn-secondary">
              Admin Dashboard
            </button>
          </div>
        </div>

        <div className="hero-highlights">
          <div className="highlight-card">
            <h3>Fast Reporting</h3>
            <p>Submit issue details quickly with images, category selection, and clear location data.</p>
          </div>
          <div className="highlight-card">
            <h3>Real-Time Tracking</h3>
            <p>Monitor issue progress, status updates, and maintenance assignments in one place.</p>
          </div>
          <div className="highlight-card">
            <h3>Structured Workflow</h3>
            <p>Keep ownership visible across users, staff, and admins with a consistent maintenance process.</p>
          </div>
        </div>
      </section>

      <section className="roles-section">
        <div className="section-intro">
          <p className="section-label">Choose your access</p>
          <h2>Login or register by role</h2>
        </div>

        <div className="role-grid">
          <article className="role-card">
            <div className="role-head">
              <h3>User</h3>
              <span>Report issues and follow resolution progress.</span>
            </div>
            <ul>
              <li>Report maintenance requests</li>
              <li>Upload photos and details</li>
              <li>Track issue status</li>
            </ul>
            <div className="role-actions">
              <button onClick={() => handleRoleSelect("user", "login")} className="btn-primary">
                Login
              </button>
              <button onClick={() => handleRoleSelect("user", "register")} className="btn-secondary">
                Sign Up
              </button>
            </div>
          </article>

          <article className="role-card">
            <div className="role-head">
              <h3>Admin</h3>
              <span>Manage requests and assign work to staff.</span>
            </div>
            <ul>
              <li>View all reported issues</li>
              <li>Assign tasks quickly</li>
              <li>Review staff progress</li>
            </ul>
            <div className="role-actions">
              <button onClick={() => handleRoleSelect("admin", "login")} className="btn-primary">
                Login
              </button>
              <button onClick={() => handleRoleSelect("admin", "register")} className="btn-secondary">
                Sign Up
              </button>
            </div>
          </article>

          <article className="role-card">
            <div className="role-head">
              <h3>Maintenance</h3>
              <span>Access assignments and update work status.</span>
            </div>
            <ul>
              <li>Review assigned issues</li>
              <li>Update progress in real time</li>
              <li>Complete requests efficiently</li>
            </ul>
            <div className="role-actions">
              <button onClick={() => handleRoleSelect("maintenance", "login")} className="btn-primary">
                Login
              </button>
              <button onClick={() => handleRoleSelect("maintenance", "register")} className="btn-secondary">
                Sign Up
              </button>
            </div>
          </article>
        </div>
      </section>

      <footer className="home-footer">
        <a href="/about">Learn more about the platform</a>
      </footer>
    </div>
  );
};

export default Home;