import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Plus, ArrowUpDown, RefreshCw, Layers } from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Raw Materials',
  'RAM',
  'ROM',
  'GPU',
  'Motherboard',
  'Finished Products'
];

export default function StockPage() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'movements'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustForm, setAdjustForm] = useState({
    action: 'RECEIVED',
    quantity: 10,
    employeeName: 'James Thornton',
    notes: ''
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    itemId: '',
    itemName: '',
    itemType: 'RAW_MATERIAL',
    category: 'Raw Materials',
    availableQuantity: 100,
    location: 'Warehouse A - Bin 01',
    unit: 'Units'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const invUrl = selectedCategory === 'ALL' ? '/stock/inventory' : `/stock/inventory?category=${selectedCategory}`;
      const [invRes, movRes] = await Promise.all([
        api.get(invUrl),
        api.get('/stock/movements')
      ]);
      setInventory(invRes.data || []);
      setMovements(movRes.data || []);
    } catch (err) {
      alert('Error loading stock data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleOpenAdjust = (item) => {
    setSelectedItem(item);
    setAdjustForm({
      action: 'RECEIVED',
      quantity: 10,
      employeeName: 'James Thornton',
      notes: `Stock adjustment for ${item.itemId}`
    });
    setAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await api.put(`/stock/inventory/${selectedItem.id}/adjust`, adjustForm);
      setAdjustModalOpen(false);
      loadData();
    } catch (err) {
      alert('Stock adjustment failed: ' + err.message);
    }
  };

  const handleCreateStockItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stock/inventory', createForm);
      setCreateModalOpen(false);
      setCreateForm({
        itemId: '',
        itemName: '',
        itemType: 'RAW_MATERIAL',
        category: 'Raw Materials',
        availableQuantity: 100,
        location: 'Warehouse A - Bin 01',
        unit: 'Units'
      });
      loadData();
    } catch (err) {
      alert('Failed to register stock line: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock & Inventory Management</h1>
          <p className="page-subtitle">Track raw silicon, IC dies, manufactured component stock, quarantine, rework and movements</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-sm" onClick={loadData}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setCreateModalOpen(true)}>
            <Plus size={13} /> Add Stock Item
          </button>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Stock in Inventory ({inventory.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'movements' ? 'active' : ''}`}
          onClick={() => setActiveTab('movements')}
        >
          Stock Movements Log ({movements.length})
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div>
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="info-box">Loading inventory items...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Stock ID</th>
                    <th>Item ID</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Available Qty</th>
                    <th>Reserved</th>
                    <th>Quarantine / Rework</th>
                    <th>Location</th>
                    <th>Health</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.id}</strong></td>
                      <td><code>{item.itemId}</code></td>
                      <td><strong>{item.itemName}</strong></td>
                      <td>
                        <span className="badge badge-gray">{item.category}</span>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>
                        {item.availableQuantity} {item.unit}
                      </td>
                      <td>
                        {item.reservedQuantity > 0 ? (
                          <span style={{ fontWeight: '600' }}>{item.reservedQuantity}</span>
                        ) : '0'}
                      </td>
                      <td>
                        <span style={{ fontSize: '12px' }}>
                          Q: {item.quarantineQuantity || 0} | R: {item.reworkQuantity || 0} | Rej: {item.rejectedQuantity || 0}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px' }}>{item.location}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleOpenAdjust(item)}
                        >
                          <ArrowUpDown size={12} /> Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                        No inventory lines found for {selectedCategory}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Type</th>
                <th>Action</th>
                <th>Quantity</th>
                <th>Reference</th>
                <th>Logged By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov) => (
                <tr key={mov.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                    {new Date(mov.createdAt).toLocaleString()}
                  </td>
                  <td><code>{mov.itemId}</code></td>
                  <td><strong>{mov.itemName}</strong></td>
                  <td><span className="badge badge-gray">{mov.itemType}</span></td>
                  <td><StatusBadge status={mov.action} /></td>
                  <td style={{ fontWeight: 'bold' }}>{mov.quantity}</td>
                  <td style={{ fontSize: '12px' }}>
                    {mov.referenceType ? `${mov.referenceType}: ${mov.referenceId || ''}` : 'N/A'}
                  </td>
                  <td>{mov.employeeName || 'System'}</td>
                  <td style={{ fontSize: '12px', color: '#555' }}>{mov.notes}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                    No stock movements recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={selectedItem ? `Adjust Stock: ${selectedItem.itemName} (${selectedItem.itemId})` : 'Adjust Stock'}
      >
        <form onSubmit={handleSaveAdjust}>
          <div className="form-group">
            <label className="form-label">Action *</label>
            <select
              className="form-select"
              value={adjustForm.action}
              onChange={(e) => setAdjustForm({ ...adjustForm, action: e.target.value })}
            >
              <option value="RECEIVED">RECEIVED (Inbound stock addition)</option>
              <option value="USED">USED (Consumed in production)</option>
              <option value="RESERVED">RESERVED (Hold for build)</option>
              <option value="RELEASED">RELEASED (Return hold to available)</option>
              <option value="QUARANTINED">QUARANTINED (Hold for inspection)</option>
              <option value="REWORKED">REWORKED (Transferred to rework lab)</option>
              <option value="REJECTED">REJECTED (Scrap / discard)</option>
              <option value="ADJUSTED">ADJUSTED (Audit count overwrite)</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                required
                min="1"
                className="form-input"
                value={adjustForm.quantity}
                onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Employee / Recorder *</label>
              <input
                type="text"
                required
                className="form-input"
                value={adjustForm.employeeName}
                onChange={(e) => setAdjustForm({ ...adjustForm, employeeName: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes & Justification</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={adjustForm.notes}
              onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
              placeholder="e.g. Physical cycle count discrepancy / QA quarantine transfer"
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Record Stock Adjustment
            </button>
            <button type="button" className="btn" onClick={() => setAdjustModalOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Stock Line Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register New Inventory Item Line"
      >
        <form onSubmit={handleCreateStockItem}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Item Part Code (Item ID) *</label>
              <input
                type="text"
                required
                className="form-input"
                value={createForm.itemId}
                onChange={(e) => setCreateForm({ ...createForm, itemId: e.target.value })}
                placeholder="RAW-GOLD-WIRE-01"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Item Type *</label>
              <select
                className="form-select"
                value={createForm.itemType}
                onChange={(e) => setCreateForm({ ...createForm, itemType: e.target.value, category: e.target.value })}
              >
                <option value="RAW_MATERIAL">RAW_MATERIAL</option>
                <option value="RAM">RAM</option>
                <option value="ROM">ROM</option>
                <option value="GPU">GPU</option>
                <option value="MOTHERBOARD">MOTHERBOARD</option>
                <option value="FINISHED_PRODUCT">FINISHED_PRODUCT</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={createForm.itemName}
              onChange={(e) => setCreateForm({ ...createForm, itemName: e.target.value })}
              placeholder="e.g. 99.99% Gold Bonding Wire Spool"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Initial Available Quantity *</label>
              <input
                type="number"
                required
                className="form-input"
                value={createForm.availableQuantity}
                onChange={(e) => setCreateForm({ ...createForm, availableQuantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <input
                type="text"
                className="form-input"
                value={createForm.unit}
                onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
                placeholder="Units, Wafers, Kg, Sheets"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Warehouse Location</label>
              <input
                type="text"
                className="form-input"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                placeholder="Warehouse A - Bay 04"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Register Stock Item
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
