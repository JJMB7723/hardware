const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.post('/', authenticateToken, orderController.create);
router.put('/:id/status', orderController.updateStatus);
router.put('/:id/cancel', orderController.cancel);

module.exports = router;
