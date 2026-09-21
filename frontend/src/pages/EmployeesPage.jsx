import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Users, Filter } from 'lucide-react';

const DEPARTMENTS = [
  'ALL',
  'RAM',
  'ROM',
  'GPU',
  'Motherboard',
  'Assembly',
  'Inspection',
  'Inventory',
  'Sales',
  'Delivery',
  'Administration'
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'RAM',
    role: 'Fabrication Technician',
    status: 'ACTIVE'
  });

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const url = selectedDept === 'ALL' ? '/employees' : `/employees?department=${selectedDept}`;
      const res = await api.get(url);
      setEmployees(res.data || []);
    } catch (err) {
      alert('Error loading employees: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [selectedDept]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      department: selectedDept !== 'ALL' ? selectedDept : 'RAM',
      role: 'Technician',
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setIsEditing(true);
    setCurrentId(emp.id);
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      role: emp.role,
      status: emp.status
    });
    setModalOpen(true);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/employees/${currentId}`, form);
      } else {
        await api.post('/employees', form);
      }
      setModalOpen(false);
      loadEmployees();
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm(`Deactivate employee ${id}?`)) return;
    try {
      await api.delete(`/employees/${id}`);
      loadEmployees();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Directory & Roles</h1>
          <p className="page-subtitle">Manage plant engineers, line supervisors, QA inspectors, and administration personnel</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={14} /> Add Employee
        </button>
      </div>

      {/* Department Filter Tabs */}
      <div className="tabs-container" style={{ overflowX: 'auto', flexWrap: 'wrap' }}>
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept}
            className={`tab-btn ${selectedDept === dept ? 'active' : ''}`}
            onClick={() => setSelectedDept(dept)}
          >
            {dept}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="info-box">Loading employees...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Role / Title</th>
                <th>Contact Details</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td><strong>{emp.id}</strong></td>
                  <td><strong>{emp.name}</strong></td>
                  <td>
                    <span className="badge badge-gray">{emp.department}</span>
                  </td>
                  <td>{emp.role}</td>
                  <td>
                    <div>{emp.email}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>{emp.phone}</div>
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {new Date(emp.joiningDate).toLocaleDateString()}
                  </td>
                  <td>
                    <StatusBadge status={emp.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-sm" onClick={() => handleOpenEdit(emp)}>
                        <Edit2 size={12} /> Edit
                      </button>
                      {emp.status === 'ACTIVE' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeactivate(emp.id)}>
                          <Trash2 size={12} /> Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    No employees found for department: {selectedDept}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? `Edit Employee ${currentId}` : 'Register New Employee'}
      >
        <form onSubmit={handleSaveEmployee}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Marcus Chen"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="marcus.c@apex.edu"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1-555-0199"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                {DEPARTMENTS.filter(d => d !== 'ALL').map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Role / Designation *</label>
              <input
                type="text"
                required
                className="form-input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Senior Engineer / Inspector"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Create Employee'}
            </button>
            <button type="button" className="btn" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
