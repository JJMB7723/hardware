import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Plus, Play, CheckSquare, Wrench, Factory, RefreshCw } from 'lucide-react';

const SECTORS = ['ALL', 'RAM', 'ROM', 'GPU', 'MOTHERBOARD'];

export default function ManufacturingPage() {
  const [activeSector, setActiveSector] = useState('ALL');
  const [activeTab, setActiveTab] = useState('batches'); // 'batches' | 'components'
  const [batches, setBatches] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Batch Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    sector: 'GPU',
    rawMaterialUsed: 'High-Purity Silicon Wafers (300mm), Copper Heatpipe Matrix',
    quantityPlanned: 20,
    employeeId: 'EMP-001',
    employeeName: 'Marcus Chen',
    remarks: 'Scheduled fabrication run'
  });

  // Produce Batch Modal
  const [produceModalOpen, setProduceModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [produceForm, setProduceForm] = useState({
    quantityProduced: 20,
    quantityPassed: 19,
    quantityFailed: 1,
    employeeName: 'Marcus Chen'
  });

  // Validate Modal
  const [validateModalOpen, setValidateModalOpen] = useState(false);
  const [validateForm, setValidateForm] = useState({
    testResult: 'PASS',
    testParameters: 'Electrical continuity, clock signal integrity, 4K stress loop',
    testedBy: 'Elena Rostova',
    remarks: 'Component parameters conform to QA specification'
  });

  // Rework Modal
  const [reworkModalOpen, setReworkModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [reworkForm, setReworkForm] = useState({
    testedBy: 'Marcus Chen',
    remarks: 'Micro-soldering reflow completed, secondary power trace verified'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const batchUrl = activeSector === 'ALL' ? '/manufacturing/batches' : `/manufacturing/batches?sector=${activeSector}`;
      const compUrl = activeSector === 'ALL' ? '/manufacturing/components' : `/manufacturing/components?type=${activeSector}`;

      const [bRes, cRes] = await Promise.all([
        api.get(batchUrl),
        api.get(compUrl)
      ]);
      setBatches(bRes.data || []);
      setComponents(cRes.data || []);
    } catch (err) {
      alert('Error loading manufacturing data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSector]);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      await api.post('/manufacturing/batches', createForm);
      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      alert('Failed to schedule batch: ' + err.message);
    }
  };

  const handleOpenProduce = (batch) => {
    setSelectedBatch(batch);
    setProduceForm({
      quantityProduced: batch.quantityPlanned,
      quantityPassed: batch.quantityPlanned,
      quantityFailed: 0,
      employeeName: batch.employeeName || 'Marcus Chen'
    });
    setProduceModalOpen(true);
  };

  const handleExecuteProduce = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;
    try {
      await api.post(`/manufacturing/batches/${selectedBatch.id}/produce`, produceForm);
      setProduceModalOpen(false);
      loadData();
    } catch (err) {
      alert('Production run failed: ' + err.message);
    }
  };

  const handleOpenValidate = (batch) => {
    setSelectedBatch(batch);
    setValidateModalOpen(true);
  };

  const handleRecordValidation = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;
    try {
      await api.post(`/manufacturing/batches/${selectedBatch.id}/validate`, validateForm);
      setValidateModalOpen(false);
      loadData();
    } catch (err) {
      alert('Validation recording failed: ' + err.message);
    }
  };

  const handleOpenRework = (comp) => {
    setSelectedComponent(comp);
    setReworkModalOpen(true);
  };

  const handleExecuteRework = async (e) => {
    e.preventDefault();
    if (!selectedComponent) return;
    try {
      await api.post(`/manufacturing/components/${selectedComponent.id}/rework`, reworkForm);
      setReworkModalOpen(false);
      loadData();
    } catch (err) {
      alert('Rework failed: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manufacturing & Component Fabrication</h1>
          <p className="page-subtitle">Cleanroom production batches for RAM, ROM, GPU, and Motherboard sectors with serialization</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-sm" onClick={loadData}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setCreateModalOpen(true)}>
            <Plus size={13} /> Schedule New Batch
          </button>
        </div>
      </div>

      {/* Sector Filter Tabs */}
      <div className="tabs-container">
        {SECTORS.map((sec) => (
          <button
            key={sec}
            className={`tab-btn ${activeSector === sec ? 'active' : ''}`}
            onClick={() => setActiveSector(sec)}
          >
            Sector: {sec}
          </button>
        ))}
      </div>

      {/* Sub-view switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={`btn btn-sm ${activeTab === 'batches' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('batches')}
        >
          Production Batches ({batches.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'components' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('components')}
        >
          Serialized Components Inventory ({components.length})
        </button>
      </div>

      {activeTab === 'batches' && (
        <div>
          {loading ? (
            <div className="info-box">Loading manufacturing batches...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Prod ID</th>
                    <th>Sector</th>
                    <th>Raw Material Spec</th>
                    <th>Planned Qty</th>
                    <th>Passed / Failed</th>
                    <th>Lead Engineer</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.id}</strong></td>
                      <td><code>{b.productionId}</code></td>
                      <td><span className="badge badge-gray">{b.sector}</span></td>
                      <td style={{ fontSize: '12px', maxWidth: '240px' }}>{b.rawMaterialUsed}</td>
                      <td style={{ fontWeight: 'bold' }}>{b.quantityPlanned}</td>
                      <td>
                        <span style={{ color: '#000', fontWeight: '600' }}>{b.quantityPassed} passed</span>
                        {b.quantityFailed > 0 && (
                          <span style={{ color: '#b91c1c', fontWeight: 'bold' }}> / {b.quantityFailed} failed</span>
                        )}
                      </td>
                      <td>{b.employeeName}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {b.status === 'PLANNED' && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleOpenProduce(b)}
                            >
                              <Play size={11} /> Run & Serialize
                            </button>
                          )}
                          {b.status !== 'PLANNED' && (
                            <button
                              className="btn btn-sm"
                              onClick={() => handleOpenValidate(b)}
                            >
                              <CheckSquare size={11} /> QA Test
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {batches.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                        No production batches recorded for {activeSector}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'components' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Component Serial ID</th>
                <th>Type</th>
                <th>Model Name</th>
                <th>Origin Batch ID</th>
                <th>Manufactured Date</th>
                <th>Status</th>
                <th>Assembly Binding</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.id}</strong></td>
                  <td><span className="badge badge-gray">{c.type}</span></td>
                  <td>{c.modelName}</td>
                  <td><code>{c.batchId}</code></td>
                  <td style={{ fontSize: '12px' }}>
                    {new Date(c.manufacturedAt).toLocaleDateString()}
                  </td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    {c.assemblyId ? (
                      <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{c.assemblyId}</span>
                    ) : (
                      <span style={{ color: '#888' }}>Unbound</span>
                    )}
                  </td>
                  <td>
                    {['FAILED', 'REWORK'].includes(c.status) && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleOpenRework(c)}
                      >
                        <Wrench size={11} /> Rework & Re-test
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {components.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    No serialized components found. Execute a batch run to serialize components.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Batch Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule Manufacturing Batch"
      >
        <form onSubmit={handleCreateBatch}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sector *</label>
              <select
                className="form-select"
                value={createForm.sector}
                onChange={(e) => setCreateForm({ ...createForm, sector: e.target.value })}
              >
                <option value="RAM">RAM</option>
                <option value="ROM">ROM</option>
                <option value="GPU">GPU</option>
                <option value="MOTHERBOARD">MOTHERBOARD</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Planned Output Units *</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={createForm.quantityPlanned}
                onChange={(e) => setCreateForm({ ...createForm, quantityPlanned: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Raw Material Specification *</label>
            <textarea
              required
              rows={2}
              className="form-textarea"
              value={createForm.rawMaterialUsed}
              onChange={(e) => setCreateForm({ ...createForm, rawMaterialUsed: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Lead Engineer *</label>
            <input
              type="text"
              required
              className="form-input"
              value={createForm.employeeName}
              onChange={(e) => setCreateForm({ ...createForm, employeeName: e.target.value })}
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Schedule Batch
            </button>
            <button type="button" className="btn" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Produce Batch Modal */}
      <Modal
        isOpen={produceModalOpen}
        onClose={() => setProduceModalOpen(false)}
        title={selectedBatch ? `Execute Run & Serialize: ${selectedBatch.id}` : 'Execute Production'}
      >
        <form onSubmit={handleExecuteProduce}>
          <div className="info-box">
            This action will run the cleanroom fabrication line, generate individual serialized component units (e.g. <code>{selectedBatch?.sector}-000001</code>), and add passed components into available stock.
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Produced *</label>
              <input
                type="number"
                required
                className="form-input"
                value={produceForm.quantityProduced}
                onChange={(e) => setProduceForm({ ...produceForm, quantityProduced: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Passed QA Check *</label>
              <input
                type="number"
                required
                className="form-input"
                value={produceForm.quantityPassed}
                onChange={(e) => setProduceForm({ ...produceForm, quantityPassed: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Failed / Defective *</label>
              <input
                type="number"
                required
                className="form-input"
                value={produceForm.quantityFailed}
                onChange={(e) => setProduceForm({ ...produceForm, quantityFailed: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Execute Production & Serialization
            </button>
            <button type="button" className="btn" onClick={() => setProduceModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Validate Batch Modal */}
      <Modal
        isOpen={validateModalOpen}
        onClose={() => setValidateModalOpen(false)}
        title={selectedBatch ? `QA Batch Test: ${selectedBatch.id}` : 'Validate Batch'}
      >
        <form onSubmit={handleRecordValidation}>
          <div className="form-group">
            <label className="form-label">Validation Result *</label>
            <select
              className="form-select"
              value={validateForm.testResult}
              onChange={(e) => setValidateForm({ ...validateForm, testResult: e.target.value })}
            >
              <option value="PASS">PASS (Quality criteria fully satisfied)</option>
              <option value="FAIL">FAIL (Deviations detected / rework required)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Test Parameters & Benchmarks</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={validateForm.testParameters}
              onChange={(e) => setValidateForm({ ...validateForm, testParameters: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tested By *</label>
              <input
                type="text"
                required
                className="form-input"
                value={validateForm.testedBy}
                onChange={(e) => setValidateForm({ ...validateForm, testedBy: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Save Validation Result
            </button>
            <button type="button" className="btn" onClick={() => setValidateModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Rework Component Modal */}
      <Modal
        isOpen={reworkModalOpen}
        onClose={() => setReworkModalOpen(false)}
        title={selectedComponent ? `Rework Component: ${selectedComponent.id}` : 'Rework Component'}
      >
        <form onSubmit={handleExecuteRework}>
          <div className="info-box">
            Executing rework will record the technical diagnosis, re-test the unit, and restore its status to <strong>AVAILABLE</strong> for system assembly.
          </div>
          <div className="form-group">
            <label className="form-label">Technician Notes & Rectification Action *</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              value={reworkForm.remarks}
              onChange={(e) => setReworkForm({ ...reworkForm, remarks: e.target.value })}
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Confirm Rework & Re-validate
            </button>
            <button type="button" className="btn" onClick={() => setReworkModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
