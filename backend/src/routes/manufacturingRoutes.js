const express = require('express');
const router = express.Router();
const manufacturingController = require('../controllers/manufacturingController');

router.get('/batches', manufacturingController.getBatches);
router.get('/batches/:id', manufacturingController.getBatchById);
router.get('/components', manufacturingController.getComponents);
router.post('/batches', manufacturingController.createBatch);
router.post('/batches/:id/produce', manufacturingController.produceBatch);
router.post('/batches/:id/validate', manufacturingController.validateBatch);
router.post('/components/:id/rework', manufacturingController.reworkComponent);

module.exports = router;
