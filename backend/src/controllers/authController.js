const authService = require('../services/authService');

/**
 * POST /api/auth/signin
 * Public admin login
 */
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.signin(email, password);
    res.json({
      success: true,
      message: 'Admin authentication successful',
      ...result
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message || 'Invalid email or password'
    });
  }
};

/**
 * POST /api/auth/signup
 * Protected: creates a new admin account (requires authenticated ADMIN)
 */
const signup = async (req, res) => {
  try {
    const newAdmin = await authService.signup(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: newAdmin
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to create admin account'
    });
  }
};

/**
 * GET /api/auth/me
 * Protected: returns current authenticated admin
 */
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }
    const user = await authService.getMe(req.user.userId || req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/auth/signout
 */
const signout = async (req, res) => {
  res.json({
    success: true,
    message: 'Signed out successfully'
  });
};

/**
 * GET /api/auth/admins
 * Protected: returns list of all admins
 */
const listAdmins = async (req, res) => {
  try {
    const admins = await authService.listAdmins();
    res.json({ success: true, data: admins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/auth/admins/:id/status
 * Protected: updates admin status (activate/deactivate)
 */
const updateAdminStatus = async (req, res) => {
  try {
    const updated = await authService.updateAdminStatus(req.params.id, req.body.status, req.user);
    res.json({ success: true, data: updated, message: 'Admin status updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  signin,
  signup,
  getMe,
  signout,
  listAdmins,
  updateAdminStatus
};
