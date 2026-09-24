const returnService = require('../services/returnService');

const getAll = async (req, res) => {
  try {
    const { status } = req.query;
    const returns = await returnService.getAllReturns(status);
    res.json({ success: true, data: returns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const returnItem = await returnService.getReturnById(req.params.id);
    res.json({ success: true, data: returnItem });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const returnItem = await returnService.createReturn(req.body);
    res.status(201).json({ success: true, data: returnItem });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const returnItem = await returnService.updateReturnStatus(req.params.id, req.body);
    res.json({ success: true, data: returnItem });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  updateStatus
};
