const { authenticateToken, requireAuth, JWT_SECRET } = require('./auth.middleware');
const { requireAdmin } = require('./role.middleware');

const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Requires one of roles: [${roles.join(', ')}]` 
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireAuth,
  requireRoles,
  requireAdmin,
  JWT_SECRET
};
