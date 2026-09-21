const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

router.get('/', returnController.getAll);
router.get('/:id', returnController.getById);
router.post('/', returnController.create);
router.put('/:id/status', returnController.updateStatus);

module.exports = router;
