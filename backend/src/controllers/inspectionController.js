const inspectionService = require('../services/inspectionService');

class InspectionController {
  async getAll(req, res) {
    try {
      const inspections = await inspectionService.getAllInspections();
      res.json({ success: true, data: inspections });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const inspection = await inspectionService.getInspectionById(req.params.id);
      res.json({ success: true, data: inspection });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const inspection = await inspectionService.createInspection(req.body);
      res.status(201).json({ success: true, data: inspection });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new InspectionController();
