const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

router.get('/', deliveryController.getAll);
router.get('/:id', deliveryController.getById);
router.get('/:id/track', deliveryController.track);
router.put('/:id/status', deliveryController.updateStatus);

module.exports = router;
