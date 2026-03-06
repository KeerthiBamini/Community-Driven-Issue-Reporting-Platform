import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
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
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* MEMBER ROUTES */}
        <Route
          path="/member/dashboard"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
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
            <ProtectedRoute allowedRoles={["staff"]}>
              <MaintenanceDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch All Route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

export default AppRoutes;