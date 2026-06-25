
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_ISSUER = process.env.JWT_ISSUER || "community-issues-api";

/**
 * Generate Access Token
 * @param {String} userId
 * @param {String} role
 * @returns {String} token
 */
const generateAccessToken = (userId, role) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: userId,
      role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: JWT_ISSUER,
    }
  );
};

module.exports = generateAccessToken;
