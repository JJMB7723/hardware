const deliveryService = require('../services/deliveryService');

class DeliveryController {
  async getAll(req, res) {
    try {
      const { status } = req.query;
      const deliveries = await deliveryService.getAllDeliveries(status);
      res.json({ success: true, data: deliveries });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const delivery = await deliveryService.getDeliveryById(req.params.id);
      res.json({ success: true, data: delivery });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async track(req, res) {
    try {
      const tracking = await deliveryService.trackDelivery(req.params.id);
      res.json({ success: true, data: tracking });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const delivery = await deliveryService.updateDeliveryStatus(req.params.id, req.body);
      res.json({ success: true, data: delivery });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new DeliveryController();
