
const jwt = require("jsonwebtoken");

/**
 * Generate Access Token
 * @param {String} userId
 * @param {String} role
 * @returns {String} token
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role: role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d", // token expires in 7 days
    }
  );
};

module.exports = generateAccessToken;