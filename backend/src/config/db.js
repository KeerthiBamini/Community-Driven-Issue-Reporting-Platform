const mongoose = require("mongoose");

/**
 * Connect to MongoDB
 * Uses environment variable MONGO_URI from .env
 */
const connectDB = async () => {
  try {
    // 1. Check if URI exists before connecting
    if (!process.env.MONGO_URI) {
      console.error("❌ Error: MONGO_URI is not defined in your .env file.");
      process.exit(1);
    }

    // 2. Connect to MongoDB
    // Cleaned up options for modern Mongoose versions
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected Successfully`);
    console.log(`📦 Host: ${conn.connection.host}`);
    console.log(`📂 Database Name: ${conn.connection.name}`);
    
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(`Error: ${error.message}`);

    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;