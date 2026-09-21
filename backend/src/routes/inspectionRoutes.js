const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspectionController');

router.get('/', inspectionController.getAll);
router.get('/:id', inspectionController.getById);
router.post('/', inspectionController.create);

module.exports = router;
