
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log("🔒 AuthorizeRoles middleware called for:", req.path, "User role:", req.user?.role, "Required roles:", roles);
    try {
      // Make sure user exists (protect middleware should run first)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          code: "UNAUTHORIZED"
        });
      }

      // Check if user's role is allowed
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to access this resource",
          code: "FORBIDDEN"
        });
      }

      // User has permission
      next();

    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authorizeRoles };