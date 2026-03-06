import React, { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css"; 
const App = () => {
  const { loading } = useContext(AuthContext);

  // Show loader while checking authentication
  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loader}></div>
        <p>Loading Application...</p>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <AppRoutes />
    </div>
  );
};

const styles = {
  loaderContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "var(--bg-body)",
  },
  loader: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid var(--color-primary)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "10px",
  },
};

export default App;