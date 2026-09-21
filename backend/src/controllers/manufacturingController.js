const manufacturingService = require('../services/manufacturingService');

class ManufacturingController {
  async getBatches(req, res) {
    try {
      const { sector, status } = req.query;
      const batches = await manufacturingService.getBatches(sector, status);
      res.json({ success: true, data: batches });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getBatchById(req, res) {
    try {
      const batch = await manufacturingService.getBatchById(req.params.id);
      res.json({ success: true, data: batch });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async getComponents(req, res) {
    try {
      const { type, status } = req.query;
      const components = await manufacturingService.getComponents(type, status);
      res.json({ success: true, data: components });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createBatch(req, res) {
    try {
      const batch = await manufacturingService.createBatch(req.body);
      res.status(201).json({ success: true, data: batch });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async produceBatch(req, res) {
    try {
      const result = await manufacturingService.produceBatch(req.params.id, req.body);
      res.json({ success: true, data: result, message: 'Production run executed & components serialized.' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async validateBatch(req, res) {
    try {
      const result = await manufacturingService.validateBatch(req.params.id, req.body);
      res.json({ success: true, data: result, message: 'Batch validation recorded' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async reworkComponent(req, res) {
    try {
      const result = await manufacturingService.reworkComponent(req.params.id, req.body);
      res.json({ success: true, data: result, message: 'Component reworked and restored to available status' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new ManufacturingController();
