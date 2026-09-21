const express = require('express');
const router = express.Router();
const assemblyController = require('../controllers/assemblyController');

router.get('/', assemblyController.getAssemblies);
router.get('/availability', assemblyController.checkAvailability);
router.get('/:id', assemblyController.getAssemblyById);
router.post('/execute', assemblyController.executeAssembly);

module.exports = router;
