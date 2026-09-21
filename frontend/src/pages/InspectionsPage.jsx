import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { CheckSquare, Plus, RefreshCw, Eye } from 'lucide-react';

const DECISIONS = [
  'DEFECT CONFIRMED',
  'DEFECT NOT CONFIRMED',
  'REPAIR',
  'REPLACEMENT',
  'REFUND',
  'REJECT'
];

const DEFECT_TYPES = [
  'COMPONENT_FAILURE',
  'PHYSICAL_DAMAGE',
  'COMPATIBILITY_ISSUE',
  'ASSEMBLY_DEFECT',
  'NO_DEFECT'
];

export default function InspectionsPage() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [form, setForm] = useState({
    returnId: 'RET-2026-000001',
    productId: 'PC-2026-000001',
    inspectorId: 'EMP-006',
    inspectorName: 'Elena Rostova',
    defectType: 'COMPONENT_FAILURE',
    defectDescription: 'Thermal throttling on VRAM VRM stage during 3D workload test.',
    testResult: 'FAIL',
    remarks: 'Root cause linked to GPU component batch GPU-BATCH-001.',
    finalDecision: 'REPLACEMENT'
  });

  const loadInspections = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inspections');
      setInspections(res.data || []);
    } catch (err) {
      alert('Error loading inspections: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspections();
  }, []);

  const handleCreateInspection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inspections', form);
      setCreateModalOpen(false);
      loadInspections();
    } catch (err) {
      alert('Failed to log inspection: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Defect Inspection & Diagnostics</h1>
          <p className="page-subtitle">Inspect returned systems and failed fabrication components, log diagnostics, and determine RMA decisions</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-sm" onClick={loadInspections}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setCreateModalOpen(true)}>
            <Plus size={13} /> Log Inspection Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="info-box">Loading inspection reports...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Inspection ID</th>
                <th>Product ID</th>
                <th>Return Ref</th>
                <th>Inspector</th>
                <th>Inspection Date / Time</th>
                <th>Defect Type</th>
                <th>Test Result</th>
                <th>Remarks</th>
                <th>Final Decision</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((insp) => (
                <tr key={insp.id}>
                  <td><strong>{insp.id}</strong></td>
                  <td><strong>{insp.productId}</strong></td>
                  <td>{insp.returnId ? <code>{insp.returnId}</code> : 'Direct Plant QA'}</td>
                  <td>{insp.inspectorName}</td>
                  <td style={{ fontSize: '12px' }}>
                    {new Date(insp.inspectionDate).toLocaleDateString()} {insp.inspectionTime || ''}
                  </td>
                  <td><span className="badge badge-gray">{insp.defectType}</span></td>
                  <td><StatusBadge status={insp.testResult} /></td>
                  <td style={{ fontSize: '12px', maxWidth: '200px' }}>{insp.remarks}</td>
                  <td>
                    <span className="badge badge-filled">{insp.finalDecision}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => {
                        setSelectedInspection(insp);
                        setDetailModalOpen(true);
                      }}
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {inspections.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                    No inspection reports filed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Log Inspection Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Record Defect Inspection Report"
      >
        <form onSubmit={handleCreateInspection}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Return ID (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={form.returnId}
                onChange={(e) => setForm({ ...form, returnId: e.target.value })}
                placeholder="RET-2026-000001"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Product / Serial ID *</label>
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
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Inspector Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={form.inspectorName}
                onChange={(e) => setForm({ ...form, inspectorName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Test Diagnostic Result *</label>
              <select
                className="form-select"
                value={form.testResult}
                onChange={(e) => setForm({ ...form, testResult: e.target.value })}
              >
                <option value="FAIL">FAIL (Defect reproduced)</option>
                <option value="PASS">PASS (No defect found)</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Defect Category *</label>
              <select
                className="form-select"
                value={form.defectType}
                onChange={(e) => setForm({ ...form, defectType: e.target.value })}
              >
                {DEFECT_TYPES.map((dt) => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Final QA Decision *</label>
              <select
                className="form-select"
                value={form.finalDecision}
                onChange={(e) => setForm({ ...form, finalDecision: e.target.value })}
              >
                {DECISIONS.map((dec) => (
                  <option key={dec} value={dec}>{dec}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Defect Description & Diagnostic Evidence *</label>
            <textarea
              required
              rows={2}
              className="form-textarea"
              value={form.defectDescription}
              onChange={(e) => setForm({ ...form, defectDescription: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Inspector Technical Remarks</label>
            <input
              type="text"
              className="form-input"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Log Inspection & Update RMA
            </button>
            <button type="button" className="btn" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedInspection ? `Inspection: ${selectedInspection.id}` : 'Inspection Details'}
      >
        {selectedInspection && (
          <div>
            <div className="form-row" style={{ marginBottom: '12px' }}>
              <div><strong>Target Product:</strong> {selectedInspection.productId}</div>
              <div><strong>Return ID:</strong> {selectedInspection.returnId || 'N/A'}</div>
            </div>
            <div className="form-row" style={{ marginBottom: '12px' }}>
              <div><strong>Inspector:</strong> {selectedInspection.inspectorName}</div>
              <div><strong>Date / Time:</strong> {new Date(selectedInspection.inspectionDate).toLocaleDateString()} {selectedInspection.inspectionTime}</div>
            </div>
            <div className="form-row" style={{ marginBottom: '12px' }}>
              <div><strong>Defect Type:</strong> {selectedInspection.defectType}</div>
              <div><strong>Diagnostic Result:</strong> <StatusBadge status={selectedInspection.testResult} /></div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Description:</strong>
              <div className="code-block" style={{ marginTop: '4px' }}>
                {selectedInspection.defectDescription}
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Inspector Remarks:</strong> {selectedInspection.remarks}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Final Decision:</strong> <span className="badge badge-filled">{selectedInspection.finalDecision}</span>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
