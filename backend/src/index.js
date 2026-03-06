
require("dotenv").config(); 

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");


// 2. Import Routes
const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");
const adminRoutes = require("./routes/adminRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");

// 3. Connect to Database
connectDB();

const app = express();

// --- Middlewares ---
app.use(express.json());
app.use(cors());

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/maintenance", maintenanceRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ success: true, message: "🚀 API Running Successfully" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route Not Found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Internal Error Stack:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 4. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // Verification log
  console.log(`🔗 DB Status: ${process.env.MONGO_URI ? "✅ URI Loaded" : "❌ URI Missing"}`);
});