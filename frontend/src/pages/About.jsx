import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About Us</h1>
        <p>
          Welcome to the Maintenance Management System. We are dedicated to providing
          efficient and reliable maintenance services for residential communities.
        </p>
        <p>
          Our platform connects residents, administrators, and maintenance staff to
          ensure that all issues are reported, tracked, and resolved promptly.
        </p>
        <h2>Our Mission</h2>
        <p>
          To streamline maintenance processes and improve quality of life in residential
          areas through innovative technology and excellent service.
        </p>
        <h2>Features</h2>
        <ul>
          <li>Easy issue reporting for residents</li>
          <li>Efficient assignment and tracking for administrators</li>
          <li>Streamlined task management for maintenance staff</li>
          <li>Real-time updates and notifications</li>
        </ul>
        <Link to="/" className="back-home-btn">Back to Home</Link>
      </div>
    </div>
  );
};

export default About;