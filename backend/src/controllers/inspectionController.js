const inspectionService = require('../services/inspectionService');

const getAll = async (req, res) => {
  try {
    const inspections = await inspectionService.getAllInspections();
    res.json({ success: true, data: inspections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const inspection = await inspectionService.getInspectionById(req.params.id);
    res.json({ success: true, data: inspection });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const inspection = await inspectionService.createInspection(req.body);
    res.status(201).json({ success: true, data: inspection });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAll,
  getById,
  create
};
