
const errorHandler = (err, req, res, next) => {
  console.error(err); // Log for debugging

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code || "SERVER_ERROR";

  // =====================================================
  // 📌 Handle Invalid MongoDB ObjectId
  // =====================================================
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
    code = "INVALID_OBJECT_ID";
  }

  // =====================================================
  // 📌 Handle Duplicate Key Error (e.g., email unique)
  // =====================================================
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
    code = "DUPLICATE_FIELD";
  }

  // =====================================================
  // 📌 Handle Mongoose Validation Errors
  // =====================================================
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    code = "VALIDATION_ERROR";
  }

  // =====================================================
  // 📌 Handle JWT Errors
  // =====================================================
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    code = "TOKEN_INVALID";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  }

  // =====================================================
  // 📦 Send Standardized Error Response
  // =====================================================

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

module.exports = errorHandler;