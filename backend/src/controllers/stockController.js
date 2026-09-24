const stockService = require('../services/stockService');

const getInventory = async (req, res) => {
  try {
    const { category, type } = req.query;
    const items = await stockService.getInventory(category, type);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMovements = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 50);
    const movements = await stockService.getMovements(limit);
    res.json({ success: true, data: movements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createInventoryItem = async (req, res) => {
  try {
    const item = await stockService.createInventoryItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const item = await stockService.updateStockQuantity(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getInventory,
  getMovements,
  createInventoryItem,
  updateStock
};
