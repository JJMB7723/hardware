import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { RefreshCw, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/metrics');
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <div className="info-box">Loading system dashboard metrics...</div>;
  if (error) return <div className="info-box" style={{ borderColor: '#dc2626', color: '#dc2626' }}>Error: {error}</div>;

  const m = data?.metrics || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Management Dashboard</h1>
          <p className="page-subtitle">High-level status overview of manufacturing sectors, inventory, orders, and quality</p>
        </div>
        <button className="btn btn-sm" onClick={loadDashboard}>
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* KPI Metric Number Boxes */}
      <div className="metric-grid">
        <div className="metric-box">
          <div className="metric-label">Finished Products</div>
          <div className="metric-value">{m.products || 0}</div>
        </div>
        <div className="metric-box">
          <div className="metric-label">Total Orders</div>
          <div className="metric-value">{m.orders || 0}</div>
        </div>
        <div className="metric-box">
          <div className="metric-label">Active Employees</div>
          <div className="metric-value">{m.employees || 0}</div>
        </div>
        <div className="metric-box">
          <div className="metric-label">Stock Item Lines</div>
          <div className="metric-value">{m.stockItems || 0}</div>
        </div>
        <div className="metric-box">
          <div className="metric-label">Mfg Batches</div>
          <div className="metric-value">{m.manufacturing || 0}</div>
        </div>
        <div className="metric-box">
          <div className="metric-label">Assembly Runs</div>
          <div className="metric-value">{m.assembly || 0}</div>
        </div>
        <div className="metric-box">
          <div className="metric-label">Customer Returns</div>
          <div className="metric-value">{m.returns || 0}</div>
        </div>
        <div className="metric-box">
          <div className="metric-label">Defect Inspections</div>
          <div className="metric-value">{m.pendingInspections || 0}</div>
        </div>
        <div className="metric-box">
          <div className="metric-label">Deliveries Logged</div>
          <div className="metric-value">{m.deliveries || 0}</div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Recent Orders */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <span>Recent Orders</span>
            <Link to="/orders" className="btn btn-sm">View All <ArrowRight size={12} /></Link>
          </div>
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentOrders || []).map((o) => (
                  <tr key={o.id}>
                    <td><strong>{o.id}</strong></td>
                    <td>{o.customerName}</td>
                    <td>${o.totalAmount.toFixed(2)}</td>
                    <td><StatusBadge status={o.orderStatus} /></td>
                  </tr>
                ))}
                {(data?.recentOrders || []).length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center' }}>No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <span>Recent Stock Movements</span>
            <Link to="/stock" className="btn btn-sm">View Stock <ArrowRight size={12} /></Link>
          </div>
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Action</th>
                  <th>Qty</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentMovements || []).map((mov) => (
                  <tr key={mov.id}>
                    <td><strong>{mov.itemId}</strong></td>
                    <td><StatusBadge status={mov.action} /></td>
                    <td>{mov.quantity}</td>
                    <td>{mov.employeeName || 'System'}</td>
                  </tr>
                ))}
                {(data?.recentMovements || []).length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center' }}>No movements recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Real-time Traceability Event Stream */}
      <div className="card">
        <div className="card-header">
          <span>Live Manufacturing & Traceability Event Log</span>
          <Link to="/traceability" className="btn btn-sm">Deep Traceability Search <ArrowRight size={12} /></Link>
        </div>
        <div className="table-container" style={{ margin: 0, border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Sector / Event</th>
                <th>Target Reference</th>
                <th>Operator</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentEvents || []).map((ev) => (
                <tr key={ev.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {new Date(ev.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <StatusBadge status={ev.eventType} />
                  </td>
                  <td>
                    <strong>{ev.finishedProductId || ev.componentId || ev.batchId || ev.assemblyId}</strong>
                  </td>
                  <td>{ev.actorName || 'N/A'}</td>
                  <td>{ev.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
