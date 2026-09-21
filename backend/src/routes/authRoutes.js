const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// Public sign in
router.post('/signin', authController.signin);
router.post('/login', authController.signin); // Alias for compatibility
router.post('/signout', authController.signout);

// Protected Auth & Admin endpoints (Require valid JWT + ADMIN role)
router.get('/me', requireAuth, authController.getMe);
router.post('/signup', requireAuth, requireAdmin, authController.signup);
router.get('/admins', requireAuth, requireAdmin, authController.listAdmins);
router.put('/admins/:id/status', requireAuth, requireAdmin, authController.updateAdminStatus);

module.exports = router;
