const productService = require('../services/productService');

class ProductController {
  async getAll(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.json({ success: true, data: products });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json({ success: true, data: product });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new ProductController();
