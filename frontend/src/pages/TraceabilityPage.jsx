import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Search, GitBranch, Clock, CheckCircle2, AlertCircle, FileText, RefreshCw } from 'lucide-react';

export default function TraceabilityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || 'PC-2026-000001');
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (searchTerm) => {
    const term = (searchTerm || query || '').trim();
    if (!term) return;

    setLoading(true);
    setError(null);
    setTraceData(null);
    setSearchParams({ q: term });

    try {
      // 1. Try Product
      try {
        const pRes = await api.get(`/traceability/product/${term}`);
        setTraceData(pRes.data);
        setLoading(false);
        return;
      } catch (e) { /* continue */ }

      // 2. Try Component
      try {
        const cRes = await api.get(`/traceability/component/${term}`);
        setTraceData(cRes.data);
        setLoading(false);
        return;
      } catch (e) { /* continue */ }

      // 3. Try Batch
      try {
        const bRes = await api.get(`/traceability/batch/${term}`);
        setTraceData(bRes.data);
        setLoading(false);
        return;
      } catch (e) { /* continue */ }

      // 4. Try Assembly
      try {
        const aRes = await api.get(`/traceability/assembly/${term}`);
        setTraceData(aRes.data);
        setLoading(false);
        return;
      } catch (e) { /* continue */ }

      setError(`No matching traceability records found for query "${term}".`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hardware Traceability & Component Lineage</h1>
          <p className="page-subtitle">End-to-end audit tree linking raw material batches, component serial numbers, assembly validation, orders, deliveries, and QA inspection</p>
        </div>
      </div>

      {/* Universal Search Bar */}
      <div className="card" style={{ border: '2px solid #000' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
        >
          <div className="search-bar" style={{ margin: 0 }}>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '14px', fontWeight: 'bold' }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Finished Product ID, Component Serial, Assembly ID, or Batch ID..."
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>
              <Search size={16} /> Trace Lineage
            </button>
          </div>
        </form>

        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666' }}>Quick Demo Presets:</span>
          <button className="btn btn-sm" onClick={() => { setQuery('PC-2026-000001'); handleSearch('PC-2026-000001'); }}>
            PC-2026-000001 (Finished Unit)
          </button>
          <button className="btn btn-sm" onClick={() => { setQuery('GPU-000001'); handleSearch('GPU-000001'); }}>
            GPU-000001 (Defective Component)
          </button>
          <button className="btn btn-sm" onClick={() => { setQuery('GPU-BATCH-001'); handleSearch('GPU-BATCH-001'); }}>
            GPU-BATCH-001 (Mfg Batch)
          </button>
          <button className="btn btn-sm" onClick={() => { setQuery('ASM-2026-000001'); handleSearch('ASM-2026-000001'); }}>
            ASM-2026-000001 (Assembly Run)
          </button>
        </div>
      </div>

      {loading && <div className="info-box">Querying chronological ledger & lineage graph...</div>}
      {error && <div className="info-box" style={{ borderColor: '#dc2626', color: '#dc2626' }}>{error}</div>}

      {traceData && (
        <div>
          {/* Top Summary Banner */}
          <div className="card" style={{ backgroundColor: '#fcfcfc' }}>
            <div className="card-header">
              <span>Traceability Report Target: {traceData.type}</span>
              <span className="badge badge-filled">{traceData.type} RECORD</span>
            </div>

            {traceData.type === 'PRODUCT' && (
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{traceData.product?.name}</div>
                <div style={{ fontFamily: 'monospace', margin: '4px 0' }}>Product Serial ID: <strong>{traceData.product?.id}</strong></div>
                <div style={{ fontSize: '12px', color: '#555' }}>Specs: {traceData.product?.specifications}</div>
                {traceData.assembly && (
                  <div style={{ marginTop: '8px', fontSize: '12px' }}>
                    <strong>Assembly Parent:</strong> {traceData.assembly.id} (Completed by {traceData.assembly.employeeName} on {new Date(traceData.assembly.assemblyDate).toLocaleString()})
                  </div>
                )}
              </div>
            )}

            {traceData.type === 'COMPONENT' && (
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{traceData.component?.modelName} ({traceData.component?.type})</div>
                <div style={{ fontFamily: 'monospace', margin: '4px 0' }}>Component Serial ID: <strong>{traceData.component?.id}</strong></div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  Origin Batch: <strong>{traceData.component?.batchId}</strong> | Status: <StatusBadge status={traceData.component?.status} />
                </div>
                {traceData.component?.notes && (
                  <div style={{ marginTop: '6px', fontSize: '12px' }}>
                    <strong>QA Notes:</strong> {traceData.component?.notes}
                  </div>
                )}
              </div>
            )}

            {traceData.type === 'BATCH' && (
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Manufacturing Batch: {traceData.batch?.id}</div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  Sector: <strong>{traceData.batch?.sector}</strong> | Output: {traceData.batch?.quantityProduced} / {traceData.batch?.quantityPlanned} Units | Status: <StatusBadge status={traceData.batch?.status} />
                </div>
                <div style={{ marginTop: '6px', fontSize: '12px' }}>
                  <strong>Raw Material Inputs:</strong> {traceData.batch?.rawMaterialUsed}
                </div>
              </div>
            )}

            {traceData.type === 'ASSEMBLY' && (
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Assembly Run: {traceData.assembly?.id}</div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  Product Target: {traceData.assembly?.productName} | Supervisor: {traceData.assembly?.employeeName} | Final Validation: <StatusBadge status={traceData.assembly?.finalValidationResult} />
                </div>
              </div>
            )}
          </div>

          {/* Component Lineage Tree View */}
          {traceData.type === 'PRODUCT' && traceData.components?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span>Hardware Component Bill of Materials & Origin Batches</span>
                <span style={{ fontSize: '11px', color: '#666' }}>Click any component to drill down</span>
              </div>

              <div className="table-container" style={{ margin: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sector</th>
                      <th>Component Serial ID</th>
                      <th>Model & Specifications</th>
                      <th>Origin Mfg Batch</th>
                      <th>Batch Status</th>
                      <th>Manufacture Timestamp</th>
                      <th>Validation Timestamp</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traceData.components.map((c) => (
                      <tr key={c.id}>
                        <td><span className="badge badge-gray">{c.type}</span></td>
                        <td><strong>{c.id}</strong></td>
                        <td>{c.modelName}</td>
                        <td><code>{c.batchId}</code></td>
                        <td><StatusBadge status={c.batch?.status || 'PASSED'} /></td>
                        <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                          {new Date(c.manufacturedAt).toLocaleString()}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                          {c.validatedAt ? new Date(c.validatedAt).toLocaleString() : 'N/A'}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm"
                            onClick={() => {
                              setQuery(c.id);
                              handleSearch(c.id);
                            }}
                          >
                            Trace Component
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Validation QA Diagnostic Evidence */}
          {traceData.validationRecords?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span>Formal QA & Validation Benchmark Logs</span>
              </div>
              <div className="table-container" style={{ margin: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Validated At</th>
                      <th>Validation Scope</th>
                      <th>Reference ID</th>
                      <th>Test Type</th>
                      <th>Result</th>
                      <th>Tested By</th>
                      <th>Bench Parameters & Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traceData.validationRecords.map((vr) => (
                      <tr key={vr.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                          {new Date(vr.validatedAt).toLocaleString()}
                        </td>
                        <td>{vr.referenceType}</td>
                        <td><code>{vr.referenceId}</code></td>
                        <td><strong>{vr.validationType}</strong></td>
                        <td><StatusBadge status={vr.result} /></td>
                        <td>{vr.testedBy}</td>
                        <td style={{ fontSize: '12px' }}>
                          {vr.testParameters} — {vr.remarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* End-to-End Chronological Event Timeline */}
          <div className="card">
            <div className="card-header">
              <span>Chronological Lifecycle Audit Timeline</span>
              <span style={{ fontSize: '11px', color: '#666' }}>PostgreSQL Timestamps & Responsible Actors</span>
            </div>

            <div className="timeline">
              {traceData.timelineEvents?.map((ev, idx) => (
                <div key={ev.id || idx} className="timeline-item">
                  <div className={`timeline-dot ${idx === 0 ? 'active' : ''}`} />
                  <div className="timeline-header">
                    <span className="badge badge-filled" style={{ fontSize: '10px' }}>
                      {ev.eventType}
                    </span>
                    {ev.sector && (
                      <span className="badge badge-gray" style={{ fontSize: '10px' }}>
                        {ev.sector}
                      </span>
                    )}
                    <span className="timeline-time">
                      {new Date(ev.timestamp).toLocaleString()}
                    </span>
                    {ev.actorName && (
                      <span style={{ fontSize: '11px', color: '#444' }}>
                        by <strong>{ev.actorName}</strong>
                      </span>
                    )}
                  </div>
                  <div className="timeline-body">
                    <div>{ev.description}</div>
                    {ev.detailsJson && (
                      <div className="code-block" style={{ marginTop: '6px', fontSize: '11px' }}>
                        {ev.detailsJson}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(!traceData.timelineEvents || traceData.timelineEvents.length === 0) && (
                <div style={{ color: '#888' }}>No chronological events logged.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
