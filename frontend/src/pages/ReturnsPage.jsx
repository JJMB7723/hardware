import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { RotateCcw, Plus, CheckSquare, RefreshCw } from 'lucide-react';

const RETURN_STATUSES = [
  'REQUESTED',
  'APPROVED',
  'RECEIVED',
  'UNDER_INSPECTION',
  'APPROVED_FOR_REPLACEMENT',
  'APPROVED_FOR_REFUND',
  'REJECTED',
  'COMPLETED'
];

export default function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const [form, setForm] = useState({
    orderId: 'ORD-2026-000001',
    productId: 'PC-2026-000001',
    customerName: 'John Doe',
    returnReason: 'Hardware instability / intermittent system crash under load'
  });

  const [statusForm, setStatusForm] = useState({
    returnStatus: 'RECEIVED',
    replacementStatus: 'NONE',
    refundStatus: 'NONE'
  });

  const navigate = useNavigate();

  const loadReturns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/returns');
      setReturns(res.data || []);
    } catch (err) {
      alert('Error loading returns: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleCreateReturn = async (e) => {
    e.preventDefault();
    try {
      await api.post('/returns', form);
      setCreateModalOpen(false);
      loadReturns();
    } catch (err) {
      alert('Failed to submit return request: ' + err.message);
    }
  };

  const handleOpenStatus = (ret) => {
    setSelectedReturn(ret);
    setStatusForm({
      returnStatus: ret.returnStatus,
      replacementStatus: ret.replacementStatus,
      refundStatus: ret.refundStatus
    });
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;
    try {
      await api.put(`/returns/${selectedReturn.id}/status`, statusForm);
      setStatusModalOpen(false);
      loadReturns();
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Returns, Replacement & Refunds (RMA)</h1>
          <p className="page-subtitle">Handle defective product returns, intake quarantine, diagnostic inspection, and replacement routing</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-sm" onClick={loadReturns}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setCreateModalOpen(true)}>
            <Plus size={13} /> Open Return Request
          </button>
        </div>
      </div>

      {/* Return Flow Diagram Box */}
      <div className="card" style={{ backgroundColor: '#fafafa', marginBottom: '20px' }}>
        <div className="card-header">Standard RMA Lifecycle Workflow</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', fontSize: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <span className="badge">1. RETURN REQUEST</span>
          <span>→</span>
          <span className="badge">2. RECEIVED & QUARANTINED</span>
          <span>→</span>
          <span className="badge">3. QA INSPECTION</span>
          <span>→</span>
          <span className="badge badge-filled">4. DECISION (REPAIR / REPLACE / REFUND)</span>
        </div>
      </div>

      {loading ? (
        <div className="info-box">Loading returns...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product ID</th>
                <th>Return Reason</th>
                <th>Request Date</th>
                <th>Return Status</th>
                <th>Replacement</th>
                <th>Refund</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((ret) => (
                <tr key={ret.id}>
                  <td><strong>{ret.id}</strong></td>
                  <td><code>{ret.orderId}</code></td>
                  <td>{ret.customerName}</td>
                  <td><strong>{ret.productId}</strong></td>
                  <td style={{ maxWidth: '220px', fontSize: '12px' }}>{ret.returnReason}</td>
                  <td style={{ fontSize: '12px' }}>
                    {new Date(ret.requestDate).toLocaleDateString()}
                  </td>
                  <td><StatusBadge status={ret.returnStatus} /></td>
                  <td><StatusBadge status={ret.replacementStatus} /></td>
                  <td><StatusBadge status={ret.refundStatus} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleOpenStatus(ret)}
                      >
                        Update RMA
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate('/inspections')}
                        title="Perform Defect Inspection"
                      >
                        <CheckSquare size={11} /> Inspect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                    No return requests filed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Return Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Initiate Customer Return Request"
      >
        <form onSubmit={handleCreateReturn}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Order ID *</label>
              <input
                type="text"
                required
                className="form-input"
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                placeholder="ORD-2026-000001"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Product Serial ID *</label>
              <input
                type="text"
                required
                className="form-input"
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                placeholder="PC-2026-000001"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Customer Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Detailed Return Reason *</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              value={form.returnReason}
              onChange={(e) => setForm({ ...form, returnReason: e.target.value })}
              placeholder="Describe symptoms, error codes, hardware behavior..."
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Submit Return Request
            </button>
            <button type="button" className="btn" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Update RMA Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={selectedReturn ? `Update RMA: ${selectedReturn.id}` : 'Update Return'}
      >
        <form onSubmit={handleSaveStatus}>
          <div className="form-group">
            <label className="form-label">Return Status *</label>
            <select
              className="form-select"
              value={statusForm.returnStatus}
              onChange={(e) => setStatusForm({ ...statusForm, returnStatus: e.target.value })}
            >
              {RETURN_STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Replacement Status</label>
              <select
                className="form-select"
                value={statusForm.replacementStatus}
                onChange={(e) => setStatusForm({ ...statusForm, replacementStatus: e.target.value })}
              >
                <option value="NONE">NONE</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="REPLACED">REPLACED</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Refund Status</label>
              <select
                className="form-select"
                value={statusForm.refundStatus}
                onChange={(e) => setStatusForm({ ...statusForm, refundStatus: e.target.value })}
              >
                <option value="NONE">NONE</option>
                <option value="PENDING">PENDING</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Save RMA Status
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
