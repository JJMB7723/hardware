import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { UserPlus, Shield, CheckCircle, RefreshCw, Power } from 'lucide-react';

export default function AdminManagementPage() {
  const { user: currentAdmin, createAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    status: 'ACTIVE'
  });

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/admins');
      setAdmins(res.data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load administrator directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    try {
      await createAdmin(form);
      setSuccessMsg(`Admin account "${form.name}" (${form.email}) created successfully.`);
      setCreateModalOpen(false);
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        status: 'ACTIVE'
      });
      loadAdmins();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    const nextStatus = admin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmText = admin.status === 'ACTIVE'
      ? `Are you sure you want to deactivate admin "${admin.name}"?`
      : `Activate admin "${admin.name}"?`;

    if (!window.confirm(confirmText)) return;

    try {
      await api.put(`/auth/admins/${admin.id}/status`, { status: nextStatus });
      setSuccessMsg(`Admin ${admin.email} status updated to ${nextStatus}.`);
      loadAdmins();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Administrator Management</h1>
          <p className="page-subtitle">Manage system administrator privileges, review creation audit lineage, and provision new admins</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-sm" onClick={loadAdmins}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setCreateModalOpen(true)}>
            <UserPlus size={14} /> Create New Admin
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="info-box" style={{ backgroundColor: '#ffffff', border: '2px solid #000', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="info-box" style={{ borderColor: '#000', backgroundColor: '#f8f8f8', color: '#000', fontWeight: 'bold', marginBottom: '16px' }}>
          {errorMsg}
        </div>
      )}

      {/* Admin Information Note */}
      <div className="card" style={{ marginBottom: '20px', backgroundColor: '#fafafa' }}>
        <div className="card-header">
          <span>Security Policy & Audit Accountability</span>
          <span className="badge badge-filled">ADMIN ACCESS</span>
        </div>
        <div style={{ fontSize: '12px', color: '#444', lineHeight: 1.5 }}>
          New administrators can only be created by an authenticated administrator. Every newly created admin account permanently records the creating admin's identity (<code>created_by</code>) and creation timestamp for system accountability.
        </div>
      </div>

      {/* Admins Table */}
      {loading ? (
        <div className="info-box">Loading administrator accounts...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Admin ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Last Login</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((adm) => {
                const isCurrent = currentAdmin && (currentAdmin.id === adm.id || currentAdmin.userId === adm.id);

                return (
                  <tr key={adm.id} style={{ backgroundColor: isCurrent ? '#fbfbfb' : 'transparent' }}>
                    <td><strong>ADM-{String(adm.id).padStart(3, '0')}</strong></td>
                    <td>
                      <strong>{adm.name}</strong>
                      {isCurrent && (
                        <span style={{ marginLeft: '6px', fontSize: '11px', color: '#666' }}>(You)</span>
                      )}
                    </td>
                    <td><code>{adm.email}</code></td>
                    <td>{adm.phone || 'N/A'}</td>
                    <td><span className="badge badge-filled">{adm.role}</span></td>
                    <td><StatusBadge status={adm.status} /></td>
                    <td style={{ fontSize: '12px' }}>{adm.createdBy || 'SYSTEM_SEED'}</td>
                    <td style={{ fontSize: '12px' }}>
                      {new Date(adm.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {adm.lastLoginAt ? new Date(adm.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td>
                      {!isCurrent && (
                        <button
                          className={`btn btn-sm ${adm.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`}
                          onClick={() => handleToggleStatus(adm)}
                          title={adm.status === 'ACTIVE' ? 'Deactivate Admin' : 'Activate Admin'}
                        >
                          <Power size={12} /> {adm.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {admins.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                    No administrator accounts registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create New Admin Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Admin Account"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="info-box" style={{ marginBottom: '16px', fontSize: '12px' }}>
            Granting administrator access gives this user full rights across all manufacturing, stock, order, and traceability subsystems.
          </div>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rachel Adams"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              required
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="rachel.adams@apex-manufacturing.edu"
              disabled={submitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                required
                className="form-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                required
                className="form-input"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1-555-0188"
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account Status *</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                disabled={submitting}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'CREATING...' : 'CREATE ADMIN'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setCreateModalOpen(false)}
              disabled={submitting}
            >
              CANCEL
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
