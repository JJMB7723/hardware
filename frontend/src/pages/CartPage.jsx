import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import { Trash2, Plus, Minus, CheckCircle2, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], grandTotal: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [form, setForm] = useState({
    customerName: 'John Doe',
    customerContact: '+1-800-555-2341 (john.doe@techcorp.com)',
    shippingAddress: '100 Silicon Way, Suite 400, San Jose, CA'
  });

  const navigate = useNavigate();

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data || { items: [], grandTotal: 0, itemCount: 0 });
    } catch (err) {
      alert('Error loading cart: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQty = async (itemId, newQty) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQty });
      loadCart();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      loadCart();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear all items in your cart?')) return;
    try {
      await api.delete('/cart');
      loadCart();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.items.length === 0) return;

    try {
      const payload = {
        customerName: form.customerName,
        customerContact: form.customerContact,
        shippingAddress: form.shippingAddress,
        items: cart.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity
        }))
      };

      const res = await api.post('/orders', payload);
      await api.delete('/cart'); // Clear cart after order

      setOrderModalOpen(false);
      setOrderSuccess(res.data);
      loadCart();
    } catch (err) {
      alert('Failed to place order: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Procurement & Order Cart</h1>
          <p className="page-subtitle">Review selected manufacturing products, adjust quantities, and generate customer orders</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" onClick={() => navigate('/products')}>
            Back to Products
          </button>
          {cart.items.length > 0 && (
            <button className="btn btn-danger" onClick={handleClearCart}>
              <Trash2 size={14} /> Clear Cart
            </button>
          )}
        </div>
      </div>

      {orderSuccess && (
        <div className="card" style={{ border: '2px solid #000', backgroundColor: '#fafafa', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <CheckCircle2 size={24} color="#000" />
            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>
              Order Successfully Generated: {orderSuccess.id}
            </h3>
          </div>
          <p>
            Your order for <strong>${orderSuccess.totalAmount?.toFixed(2)}</strong> has been confirmed and registered in production logistics.
          </p>
          <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>
              View in Orders Module
            </button>
            <button className="btn" onClick={() => navigate('/deliveries')}>
              Track Delivery
            </button>
            <button className="btn" onClick={() => setOrderSuccess(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="info-box">Loading cart items...</div>
      ) : cart.items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <ShoppingBag size={40} style={{ margin: '0 auto 12px auto', display: 'block', color: '#666' }} />
          <h3>Your cart is currently empty</h3>
          <p style={{ color: '#666', margin: '8px 0 16px 0' }}>
            Browse available products and add units to generate a formal purchase order.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            Explore Finished Products
          </button>
        </div>
      ) : (
        <div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Unit Price</th>
                  <th>Quantity (Qty)</th>
                  <th>Total Price (Qty × Unit Price)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div><strong>{item.productName}</strong></div>
                      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#555' }}>
                        ID: {item.productId}
                      </div>
                      <div style={{ fontSize: '11px', color: '#777' }}>
                        {item.specifications}
                      </div>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={11} />
                        </button>
                        <span style={{ fontWeight: 'bold', width: '28px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.availableStock}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </td>
                    <td style={{ fontWeight: '800', fontSize: '14px' }}>
                      ${item.totalPrice.toFixed(2)}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cart Grand Total Box */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <div className="card" style={{ width: '360px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Total Items:</span>
                <strong>{cart.itemCount} items</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '16px', borderTop: '1px solid #000', paddingTop: '8px' }}>
                <strong>Grand Total:</strong>
                <strong style={{ fontSize: '18px' }}>${cart.grandTotal.toFixed(2)}</strong>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px' }}
                onClick={() => setOrderModalOpen(true)}
              >
                Place Order Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Place Order Modal */}
      <Modal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title="Confirm & Dispatch Purchase Order"
      >
        <form onSubmit={handlePlaceOrder}>
          <div className="info-box">
            <strong>Order Total:</strong> ${cart.grandTotal.toFixed(2)} ({cart.itemCount} item lines)
          </div>
          <div className="form-group">
            <label className="form-label">Customer / Institution Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Customer Contact & Email *</label>
            <input
              type="text"
              required
              className="form-input"
              value={form.customerContact}
              onChange={(e) => setForm({ ...form, customerContact: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Shipping & Delivery Destination Address *</label>
            <textarea
              required
              rows={2}
              className="form-textarea"
              value={form.shippingAddress}
              onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Confirm & Place Order
            </button>
            <button type="button" className="btn" onClick={() => setOrderModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
