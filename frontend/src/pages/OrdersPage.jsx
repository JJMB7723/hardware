import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Eye, XCircle, Truck, RotateCcw } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch (err) {
      alert('Error loading orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt('Please enter the reason for cancellation:');
    if (!reason) return;

    try {
      await api.put(`/orders/${orderId}/cancel`, { reason });
      alert(`Order ${orderId} has been cancelled.`);
      loadOrders();
    } catch (err) {
      alert('Cancellation failed: ' + err.message);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    try {
      await api.put(`/orders/${selectedOrder.id}/status`, { status: newStatus });
      setStatusModalOpen(false);
      loadOrders();
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">Track hardware purchase orders, customer contracts, fulfillment and cancellation workflows</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          + New Purchase Order
        </button>
      </div>

      {loading ? (
        <div className="info-box">Loading orders...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Order Date</th>
                <th>Customer Name</th>
                <th>Contact</th>
                <th>Product(s) & Qty</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const canCancel = !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(o.orderStatus);
                const isDelivered = o.orderStatus === 'DELIVERED';

                return (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.id}</strong>
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {new Date(o.orderDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div><strong>{o.customerName}</strong></div>
                      <div style={{ fontSize: '11px', color: '#666' }}>ID: {o.customerId}</div>
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {o.customerContact}
                    </td>
                    <td>
                      {o.items?.map((item) => (
                        <div key={item.id} style={{ fontSize: '12px' }}>
                          • {item.product?.name || item.productId} (x{item.quantity})
                        </div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 'bold' }}>
                      ${o.totalAmount.toFixed(2)}
                    </td>
                    <td>
                      <StatusBadge status={o.paymentStatus} />
                    </td>
                    <td>
                      <StatusBadge status={o.orderStatus} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => {
                            setSelectedOrder(o);
                            setDetailModalOpen(true);
                          }}
                        >
                          <Eye size={12} /> Details
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => {
                            setSelectedOrder(o);
                            setNewStatus(o.orderStatus);
                            setStatusModalOpen(true);
                          }}
                        >
                          Update Status
                        </button>
                        {canCancel && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleCancelOrder(o.id)}
                            title="Cancel Order"
                          >
                            <XCircle size={12} /> Cancel
                          </button>
                        )}
                        {isDelivered && (
                          <button
                            className="btn btn-sm"
                            onClick={() => navigate(`/returns`)}
                            title="Open Return Request"
                          >
                            <RotateCcw size={12} /> Return
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                    No orders recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedOrder ? `Order Details: ${selectedOrder.id}` : 'Order Details'}
      >
        {selectedOrder && (
          <div>
            <div className="form-row" style={{ marginBottom: '12px' }}>
              <div><strong>Customer ID:</strong> {selectedOrder.customerId}</div>
              <div><strong>Customer Name:</strong> {selectedOrder.customerName}</div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Contact:</strong> {selectedOrder.customerContact}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Shipping Address:</strong> {selectedOrder.shippingAddress}
            </div>
            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div><strong>Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</div>
              <div><strong>Payment Status:</strong> <StatusBadge status={selectedOrder.paymentStatus} /></div>
              <div><strong>Order Status:</strong> <StatusBadge status={selectedOrder.orderStatus} /></div>
            </div>

            <div className="card-header">Ordered Items Breakdown</div>
            <div className="table-container" style={{ margin: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <strong>{it.product?.name || it.productId}</strong>
                        <div style={{ fontSize: '11px', color: '#666' }}>ID: {it.productId}</div>
                      </td>
                      <td>${it.unitPrice.toFixed(2)}</td>
                      <td>{it.quantity}</td>
                      <td><strong>${it.totalPrice.toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'right', marginTop: '12px', fontSize: '16px', fontWeight: 'bold' }}>
              Total: ${selectedOrder.totalAmount.toFixed(2)}
            </div>

            {selectedOrder.delivery && (
              <div className="card" style={{ marginTop: '16px' }}>
                <div className="card-header">Associated Shipment</div>
                <div><strong>Tracking No:</strong> {selectedOrder.delivery.trackingNumber}</div>
                <div><strong>Courier:</strong> {selectedOrder.delivery.courier}</div>
                <div><strong>Delivery Status:</strong> <StatusBadge status={selectedOrder.delivery.deliveryStatus} /></div>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn" onClick={() => setDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Order Status"
      >
        <form onSubmit={handleUpdateStatus}>
          <div className="form-group">
            <label className="form-label">Select Order Status</label>
            <select
              className="form-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
          <div className="info-box">
            Note: Marking an order as <strong>DELIVERED</strong> will synchronize the linked delivery record and enable return requests.
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Save Status
            </button>
            <button type="button" className="btn" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
