import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import About from "../pages/About";
import AdminLogin from "../pages/AdminLogin";
import AdminRegister from "../pages/AdminRegister";
import UserLogin from "../pages/UserLogin";
import UserRegister from "../pages/UserRegister";
import MaintenanceLogin from "../pages/MaintenanceLogin";
import MaintenanceRegister from "../pages/MaintenanceRegister";
import ReportIssue from "../pages/ReportIssue";
import UserDashboard from "../pages/UserDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import MaintenanceDashboard from "../pages/MaintenanceDashboard";

import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";

// Simple Unauthorized Page
const Unauthorized = () => (
  <div style={{ padding: "40px", textAlign: "center" }}>
    <h2>403 - Unauthorized Access</h2>
    <p>You do not have permission to access this page.</p>
  </div>
);

const AppRoutes = () => {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/maintenance/login" element={<MaintenanceLogin />} />
        <Route path="/maintenance/register" element={<MaintenanceRegister />} />
        <Route path="/report-issue" element={<ProtectedRoute allowedRoles={["user"]}><ReportIssue /></ProtectedRoute>} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* USER DASHBOARD */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* MAINTENANCE STAFF ROUTES */}
        <Route
          path="/maintenance/dashboard"
          element={
            <ProtectedRoute allowedRoles={["maintenance"]}>
              <MaintenanceDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch All Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default AppRoutes;