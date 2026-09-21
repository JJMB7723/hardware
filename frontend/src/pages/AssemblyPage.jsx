import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Layers, CheckCircle, AlertTriangle, Play, Eye, RefreshCw } from 'lucide-react';

export default function AssemblyPage() {
  const [assemblies, setAssemblies] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssembly, setSelectedAssembly] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [form, setForm] = useState({
    productName: 'Titan-X Professional Workstation PC',
    quantity: 1,
    employeeId: 'EMP-005',
    employeeName: 'Liam Wilson',
    notes: 'Assembly executed per IPC-A-610 electronic assembly standard'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [asmRes, availRes] = await Promise.all([
        api.get('/assembly'),
        api.get('/assembly/availability')
      ]);
      setAssemblies(asmRes.data || []);
      setAvailability(availRes.data || null);
    } catch (err) {
      alert('Error loading assembly data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteAssembly = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assembly/execute', form);
      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      alert('Assembly execution failed: ' + err.message);
    }
  };

  const av = availability?.available || { RAM: 0, ROM: 0, GPU: 0, Motherboard: 0 };
  const canAssemble = availability?.canAssemble;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Finished Product System Assembly</h1>
          <p className="page-subtitle">Integrate manufactured RAM, ROM, GPU, and Motherboard components into verified finished products</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-sm" onClick={loadData}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setCreateModalOpen(true)}
            disabled={!canAssemble}
          >
            <Play size={14} /> Execute Assembly Run
          </button>
        </div>
      </div>

      {/* Assembly Readiness & Component Availability Box */}
      <div className="card" style={{ marginBottom: '20px', border: '2px solid #000' }}>
        <div className="card-header">
          <span>Component Pre-Assembly Readiness Check</span>
          <span style={{ fontSize: '12px' }}>
            {canAssemble ? (
              <span style={{ fontWeight: 'bold', color: '#000' }}>[STATUS: READY FOR ASSEMBLY]</span>
            ) : (
              <span style={{ fontWeight: 'bold', color: '#b91c1c' }}>[STATUS: INSUFFICIENT HARDWARE STOCK]</span>
            )}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '10px' }}>
          <div className="metric-box">
            <div className="metric-label">Available RAM</div>
            <div className="metric-value">{av.RAM}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>1 unit required / PC</div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Available ROM (SSD)</div>
            <div className="metric-value">{av.ROM}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>1 unit required / PC</div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Available GPU</div>
            <div className="metric-value">{av.GPU}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>1 unit required / PC</div>
          </div>
          <div className="metric-box">
            <div className="metric-label">Available Motherboards</div>
            <div className="metric-value">{av.Motherboard}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>1 unit required / PC</div>
          </div>
        </div>

        <div style={{ marginTop: '14px', fontSize: '12px', backgroundColor: '#f8f9fa', padding: '8px 12px', border: '1px solid #ccc' }}>
          <strong>Compatibility Verification:</strong> {availability?.compatibilityStatus || 'All interfaces matched (DDR5 + NVMe Gen4 + PCIe 5.0 + LGA1700)'}
          <br />
          <strong>Max Possible Assembly Units:</strong> {availability?.maxAssemblePossible || 0} systems
        </div>
      </div>

      {/* Assembly Runs Table */}
      {loading ? (
        <div className="info-box">Loading assembly runs...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Assembly ID</th>
                <th>Product Target</th>
                <th>Planned / Completed</th>
                <th>RAM / ROM / GPU / MB</th>
                <th>Assembly Date</th>
                <th>Supervisor</th>
                <th>Validation Result</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assemblies.map((asm) => (
                <tr key={asm.id}>
                  <td><strong>{asm.id}</strong></td>
                  <td><strong>{asm.productName}</strong></td>
                  <td>
                    <span style={{ fontWeight: 'bold' }}>{asm.completedQuantity}</span> / {asm.plannedQuantity} Units
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {asm.ramQuantity}R / {asm.romQuantity}S / {asm.gpuQuantity}G / {asm.motherboardQuantity}M
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {new Date(asm.assemblyDate).toLocaleDateString()}
                  </td>
                  <td>{asm.employeeName}</td>
                  <td>
                    <StatusBadge status={asm.finalValidationResult} />
                  </td>
                  <td>
                    <StatusBadge status={asm.status} />
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => {
                        setSelectedAssembly(asm);
                        setDetailModalOpen(true);
                      }}
                    >
                      <Eye size={12} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
              {assemblies.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                    No assembly runs found. Click "Execute Assembly Run" to build finished systems.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Assembly Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedAssembly ? `Assembly Record: ${selectedAssembly.id}` : 'Assembly Details'}
      >
        {selectedAssembly && (
          <div>
            <div className="form-row" style={{ marginBottom: '12px' }}>
              <div><strong>Product:</strong> {selectedAssembly.productName}</div>
              <div><strong>Status:</strong> <StatusBadge status={selectedAssembly.status} /></div>
            </div>
            <div className="form-row" style={{ marginBottom: '12px' }}>
              <div><strong>Date:</strong> {new Date(selectedAssembly.assemblyDate).toLocaleString()}</div>
              <div><strong>Supervisor:</strong> {selectedAssembly.employeeName}</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Assembly Notes:</strong> {selectedAssembly.notes}
            </div>

            <div className="card-header">Bound Finished Product Units & Component Serials</div>
            <div className="table-container" style={{ margin: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Finished Product ID</th>
                    <th>RAM Serial</th>
                    <th>ROM Serial</th>
                    <th>GPU Serial</th>
                    <th>Motherboard Serial</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAssembly.assemblyItems?.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.finishedProductId}</strong></td>
                      <td><code>{item.ramComponentId}</code></td>
                      <td><code>{item.romComponentId}</code></td>
                      <td><code>{item.gpuComponentId}</code></td>
                      <td><code>{item.motherboardComponentId}</code></td>
                    </tr>
                  ))}
                  {(!selectedAssembly.assemblyItems || selectedAssembly.assemblyItems.length === 0) && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>No individual units registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Execute Assembly Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Execute Finished Product Assembly"
      >
        <form onSubmit={handleExecuteAssembly}>
          <div className="info-box">
            Assembly will automatically allocate <strong>1x RAM, 1x ROM, 1x GPU, and 1x Motherboard</strong> from available verified inventory per system unit, generate serialized Product IDs (e.g. <code>PC-2026-00000X</code>), and append them directly to catalog stock and traceability graph.
          </div>
          <div className="form-group">
            <label className="form-label">Product Name / Model *</label>
            <input
              type="text"
              required
              className="form-input"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Units to Assemble *</label>
              <input
                type="number"
                min="1"
                max={availability?.maxAssemblePossible || 1}
                required
                className="form-input"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assembly Line Supervisor *</label>
              <input
                type="text"
                required
                className="form-input"
                value={form.employeeName}
                onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assembly & QA Checklist Notes</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Run Assembly & Final QA
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
