const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'academic_manufacturing_secret_key_2026_xyz';

/**
 * Authentication Middleware:
 * 1. Reads JWT from Authorization header.
 * 2. Verifies token against secret.
 * 3. Identifies logged-in user and attaches to req.user.
 * 4. Rejects invalid or expired tokens with 401/403.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Session expired or invalid token. Please sign in again.' });
    }
    req.user = decoded;
    next();
  });
};

const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized access. Authentication required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Session expired. Please sign in again.' });
    }
    req.user = decoded;
    next();
  });
};

module.exports = {
  authenticateToken,
  requireAuth,
  JWT_SECRET
};
