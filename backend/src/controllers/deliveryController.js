const deliveryService = require('../services/deliveryService');

const getAll = async (req, res) => {
  try {
    const { status } = req.query;
    const deliveries = await deliveryService.getAllDeliveries(status);
    res.json({ success: true, data: deliveries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const delivery = await deliveryService.getDeliveryById(req.params.id);
    res.json({ success: true, data: delivery });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const track = async (req, res) => {
  try {
    const tracking = await deliveryService.trackDelivery(req.params.id);
    res.json({ success: true, data: tracking });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const delivery = await deliveryService.updateDeliveryStatus(req.params.id, req.body);
    res.json({ success: true, data: delivery });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAll,
  getById,
  track,
  updateStatus
};
