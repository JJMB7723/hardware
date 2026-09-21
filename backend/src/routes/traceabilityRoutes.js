const express = require('express');
const router = express.Router();
const traceabilityController = require('../controllers/traceabilityController');

router.get('/search', traceabilityController.search);
router.get('/product/:productId', traceabilityController.traceProduct);
router.get('/component/:componentId', traceabilityController.traceComponent);
router.get('/batch/:batchId', traceabilityController.traceBatch);
router.get('/assembly/:assemblyId', traceabilityController.traceAssembly);
router.get('/events', traceabilityController.getEvents);

module.exports = router;
