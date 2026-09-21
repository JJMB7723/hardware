const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const employeeRoutes = require('./employeeRoutes');
const stockRoutes = require('./stockRoutes');
const manufacturingRoutes = require('./manufacturingRoutes');
const assemblyRoutes = require('./assemblyRoutes');
const deliveryRoutes = require('./deliveryRoutes');
const returnRoutes = require('./returnRoutes');
const inspectionRoutes = require('./inspectionRoutes');
const traceabilityRoutes = require('./traceabilityRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const { requireAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// Public / Auth router
router.use('/auth', authRoutes);

// Protected Application API routes (Require authenticated ADMIN)
router.use('/products', requireAuth, requireAdmin, productRoutes);
router.use('/cart', requireAuth, requireAdmin, cartRoutes);
router.use('/orders', requireAuth, requireAdmin, orderRoutes);
router.use('/employees', requireAuth, requireAdmin, employeeRoutes);
router.use('/stock', requireAuth, requireAdmin, stockRoutes);
router.use('/manufacturing', requireAuth, requireAdmin, manufacturingRoutes);
router.use('/assembly', requireAuth, requireAdmin, assemblyRoutes);
router.use('/deliveries', requireAuth, requireAdmin, deliveryRoutes);
router.use('/returns', requireAuth, requireAdmin, returnRoutes);
router.use('/inspections', requireAuth, requireAdmin, inspectionRoutes);
router.use('/traceability', requireAuth, requireAdmin, traceabilityRoutes);
router.use('/dashboard', requireAuth, requireAdmin, dashboardRoutes);

module.exports = router;
