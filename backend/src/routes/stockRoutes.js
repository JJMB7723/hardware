const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/inventory', stockController.getInventory);
router.get('/movements', stockController.getMovements);
router.post('/inventory', stockController.createInventoryItem);
router.put('/inventory/:id/adjust', stockController.updateStock);

module.exports = router;
