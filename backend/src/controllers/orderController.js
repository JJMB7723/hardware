const orderService = require('../services/orderService');

class OrderController {
  async getAll(req, res) {
    try {
      const orders = await orderService.getAllOrders();
      res.json({ success: true, data: orders });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      res.json({ success: true, data: order });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const order = await orderService.createOrder(req.body);
      res.status(201).json({ success: true, data: order });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
      res.json({ success: true, data: order });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async cancel(req, res) {
    try {
      const order = await orderService.cancelOrder(req.params.id, req.body.reason);
      res.json({ success: true, data: order, message: 'Order cancelled successfully' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new OrderController();
