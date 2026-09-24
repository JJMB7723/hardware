const cartService = require('../services/cartService');

const getCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const cart = await cartService.getCart(userId);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const item = await cartService.addToCart({ ...req.body, userId });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const item = await cartService.updateQuantity(req.params.id, req.body.quantity);
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const removeItem = async (req, res) => {
  try {
    await cartService.removeItem(req.params.id);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    await cartService.clearCart(userId);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart
};
