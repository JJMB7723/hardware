import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { ShoppingCart, Plus, Eye, Check } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [cartSuccess, setCartSuccess] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    specifications: '',
    price: '',
    availableQuantity: 1,
    warrantyMonths: 12
  });

  const navigate = useNavigate();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
      const initialQty = {};
      (res.data || []).forEach(p => { initialQty[p.id] = 1; });
      setQuantities(initialQty);
    } catch (err) {
      alert('Error loading products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleQtyChange = (productId, val) => {
    const qty = Math.max(1, parseInt(val) || 1);
    setQuantities(prev => ({ ...prev, [productId]: qty }));
  };

  const handleAddToCart = async (product) => {
    const qty = quantities[product.id] || 1;
    try {
      await api.post('/cart', {
        productId: product.id,
        quantity: qty
      });
      setCartSuccess(`Added ${qty}x ${product.name} to cart!`);
      setTimeout(() => setCartSuccess(null), 3000);
    } catch (err) {
      alert('Failed to add to cart: ' + err.message);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', form);
      setCreateModalOpen(false);
      setForm({ name: '', description: '', specifications: '', price: '', availableQuantity: 1, warrantyMonths: 12 });
      loadProducts();
    } catch (err) {
      alert('Failed to create product: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Finished Products Catalog</h1>
          <p className="page-subtitle">Standard manufactured systems ready for customer order & dispatch</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" onClick={() => navigate('/cart')}>
            <ShoppingCart size={14} /> View Cart
          </button>
          <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {cartSuccess && (
        <div className="info-box" style={{ backgroundColor: '#f0fdf4', borderColor: '#16a34a', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{cartSuccess}</span>
        </div>
      )}

      {loading ? (
        <div className="info-box">Loading products...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Hardware Specifications</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Warranty</th>
                <th>Status</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.id}</strong>
                  </td>
                  <td>
                    <div><strong>{p.name}</strong></div>
                    <div style={{ fontSize: '11px', color: '#666' }}>{p.description}</div>
                  </td>
                  <td style={{ maxWidth: '280px', fontSize: '12px' }}>
                    {p.specifications || 'Standard specifications'}
                  </td>
                  <td style={{ fontWeight: 'bold' }}>
                    ${p.price.toFixed(2)}
                  </td>
                  <td>
                    <span style={{ fontWeight: p.availableQuantity > 0 ? '600' : 'bold', color: p.availableQuantity > 0 ? '#000' : '#b91c1c' }}>
                      {p.availableQuantity} units
                    </span>
                    {p.reservedQuantity > 0 && (
                      <div style={{ fontSize: '11px', color: '#666' }}>({p.reservedQuantity} reserved)</div>
                    )}
                  </td>
                  <td>{p.warrantyMonths} Mos</td>
                  <td>
                    <StatusBadge status={p.availableQuantity > 0 ? p.status : 'OUT_OF_STOCK'} />
                  </td>
                  <td style={{ width: '80px' }}>
                    <input
                      type="number"
                      min="1"
                      max={p.availableQuantity || 1}
                      className="form-input"
                      style={{ width: '60px', padding: '4px 6px', textAlign: 'center' }}
                      value={quantities[p.id] || 1}
                      onChange={(e) => handleQtyChange(p.id, e.target.value)}
                      disabled={p.availableQuantity <= 0}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleAddToCart(p)}
                        disabled={p.availableQuantity <= 0}
                      >
                        <ShoppingCart size={12} /> Add to Cart
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => {
                          setSelectedProduct(p);
                          setDetailModalOpen(true);
                        }}
                      >
                        <Eye size={12} /> Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                    No products registered in catalog. Click "+ Add Product" or assemble new units in the Assembly module.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedProduct ? `Product Specification: ${selectedProduct.id}` : 'Product Details'}
      >
        {selectedProduct && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Name:</strong> {selectedProduct.name}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Description:</strong> {selectedProduct.description}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Full Specifications:</strong>
              <div className="code-block" style={{ marginTop: '4px' }}>
                {selectedProduct.specifications}
              </div>
            </div>
            <div className="form-row" style={{ marginBottom: '12px' }}>
              <div><strong>Price:</strong> ${selectedProduct.price.toFixed(2)}</div>
              <div><strong>Available Stock:</strong> {selectedProduct.availableQuantity}</div>
              <div><strong>Warranty:</strong> {selectedProduct.warrantyMonths} Months</div>
            </div>
            {selectedProduct.assemblyId && (
              <div style={{ marginBottom: '12px' }}>
                <strong>Linked Assembly ID:</strong> {selectedProduct.assemblyId}
              </div>
            )}
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleAddToCart(selectedProduct);
                  setDetailModalOpen(false);
                }}
                disabled={selectedProduct.availableQuantity <= 0}
              >
                <ShoppingCart size={14} /> Add to Cart
              </button>
              <button className="btn" onClick={() => setDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Product Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register Finished Product"
      >
        <form onSubmit={handleCreateProduct}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Apex Workstation Pro"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="High-performance computing station"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Specifications *</label>
            <textarea
              required
              className="form-textarea"
              rows={3}
              value={form.specifications}
              onChange={(e) => setForm({ ...form, specifications: e.target.value })}
              placeholder="GPU: RTX-4080 | RAM: DDR5 16GB | ROM: 1TB NVMe | MB: Z790"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                className="form-input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="2499.00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Available Stock *</label>
              <input
                type="number"
                required
                className="form-input"
                value={form.availableQuantity}
                onChange={(e) => setForm({ ...form, availableQuantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Warranty (Months)</label>
              <input
                type="number"
                className="form-input"
                value={form.warrantyMonths}
                onChange={(e) => setForm({ ...form, warrantyMonths: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Save Product
            </button>
            <button type="button" className="btn" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
