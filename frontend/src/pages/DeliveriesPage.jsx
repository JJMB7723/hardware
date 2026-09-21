import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Truck, Search, CheckCircle, Clock, MapPin, RefreshCw } from 'lucide-react';

const STATUS_STEPS = ['PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('SHIPPED');

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/deliveries');
      setDeliveries(res.data || []);
    } catch (err) {
      alert('Error loading deliveries: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleOpenTrack = async (delivery) => {
    setSelectedDelivery(delivery);
    try {
      const res = await api.get(`/deliveries/${delivery.id}/track`);
      setTrackingData(res.data);
      setTrackModalOpen(true);
    } catch (err) {
      alert('Tracking error: ' + err.message);
    }
  };

  const handleOpenUpdate = (delivery) => {
    setSelectedDelivery(delivery);
    setNewStatus(delivery.deliveryStatus);
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedDelivery) return;
    try {
      await api.put(`/deliveries/${selectedDelivery.id}/status`, {
        deliveryStatus: newStatus
      });
      setStatusModalOpen(false);
      loadDeliveries();
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Logistics & Delivery Dispatch</h1>
          <p className="page-subtitle">Shipment dispatch scheduling, tracking numbers, and progressive delivery milestone tracking</p>
        </div>
        <button className="btn btn-sm" onClick={loadDeliveries}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="info-box">Loading shipment dispatches...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Order ID</th>
                <th>Customer & Address</th>
                <th>Courier Partner</th>
                <th>Tracking Number</th>
                <th>Dispatch Date</th>
                <th>Expected / Actual Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((del) => (
                <tr key={del.id}>
                  <td><strong>{del.id}</strong></td>
                  <td><code>{del.orderId}</code></td>
                  <td>
                    <div><strong>{del.customerName}</strong></div>
                    <div style={{ fontSize: '11px', color: '#666' }}>{del.address}</div>
                  </td>
                  <td>{del.courier}</td>
                  <td><code>{del.trackingNumber}</code></td>
                  <td style={{ fontSize: '12px' }}>
                    {del.dispatchDate ? new Date(del.dispatchDate).toLocaleDateString() : 'Pending'}
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {del.actualDeliveryDate ? (
                      <span style={{ fontWeight: 'bold' }}>{new Date(del.actualDeliveryDate).toLocaleDateString()}</span>
                    ) : (
                      del.expectedDeliveryDate ? new Date(del.expectedDeliveryDate).toLocaleDateString() : 'TBD'
                    )}
                  </td>
                  <td><StatusBadge status={del.deliveryStatus} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleOpenTrack(del)}
                      >
                        <Search size={11} /> Track
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleOpenUpdate(del)}
                      >
                        Update Stage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {deliveries.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                    No delivery records found. Place an order to generate shipments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tracking Modal with Visual Step Progression */}
      <Modal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        title={trackingData ? `Shipment Tracking: ${trackingData.delivery.trackingNumber}` : 'Shipment Tracking'}
      >
        {trackingData && (
          <div>
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="form-row">
                <div><strong>Order Reference:</strong> {trackingData.delivery.orderId}</div>
                <div><strong>Courier:</strong> {trackingData.delivery.courier}</div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <strong>Destination:</strong> {trackingData.delivery.address}
              </div>
            </div>

            <div className="card-header">Shipment Milestone Progression</div>

            <div style={{ margin: '20px 0' }}>
              {trackingData.steps?.map((st, idx) => (
                <div
                  key={st.step}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    marginBottom: '6px',
                    border: '1px solid #000',
                    backgroundColor: st.current ? '#000000' : (st.completed ? '#f0f0f0' : '#ffffff'),
                    color: st.current ? '#ffffff' : '#000000'
                  }}
                >
                  <span style={{ fontWeight: 'bold', width: '24px' }}>{idx + 1}.</span>
                  <strong style={{ flex: 1 }}>{st.label}</strong>
                  <span>
                    {st.completed && !st.current && <CheckCircle size={16} />}
                    {st.current && <Clock size={16} />}
                  </span>
                </div>
              ))}
            </div>

            {trackingData.delivery.notes && (
              <div className="info-box">
                <strong>Dispatch Notes:</strong> {trackingData.delivery.notes}
              </div>
            )}

            <div className="modal-footer">
              <button className="btn" onClick={() => setTrackModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Delivery Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Dispatch Status"
      >
        <form onSubmit={handleSaveStatus}>
          <div className="form-group">
            <label className="form-label">Delivery Stage *</label>
            <select
              className="form-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {STATUS_STEPS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="FAILED">FAILED</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Update Dispatch Status
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
