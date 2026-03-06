import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/*
  Usage Example:

  <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
  </ProtectedRoute>
*/

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  // If auth is still loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If everything is valid
  return children;
};

export default ProtectedRoute;