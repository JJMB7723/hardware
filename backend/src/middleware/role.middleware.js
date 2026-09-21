/**
 * Role-Based Authorization Middleware:
 * Allows only users with ADMIN role.
 * If user is not authenticated or role is not ADMIN, returns 403 Forbidden.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access. Please sign in.'
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access Denied. Administrator privileges required.'
    });
  }

  next();
};

module.exports = {
  requireAdmin
};
