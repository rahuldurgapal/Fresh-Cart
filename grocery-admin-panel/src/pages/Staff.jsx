import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, Bike, Eye, EyeOff, RefreshCw } from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import '../pages/Products.css';
import API_BASE from '../config.js';

const Staff = () => {
  const [agents, setAgents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal state
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState({ show: false, msg: '', type: 'success' });

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', status: 'Active'
  });

  // ── Fetch agents ────────────────────────────────────────
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/admin/agents.php`);
      const data = await res.json();
      setAgents(data.records || []);
    } catch {
      showToast('Failed to load agents.', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAgents(); }, []);

  // ── Toast helper ────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3500);
  };

  // ── Open Modals ─────────────────────────────────────────
  const openAddModal = () => {
    setEditingAgent(null);
    setFormData({ name: '', email: '', phone: '', password: '', status: 'Active' });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (agent) => {
    setEditingAgent(agent);
    setFormData({ name: agent.name, email: agent.email, phone: agent.phone || '', password: '', status: agent.status });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // ── Submit (Create / Update) ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res;
      if (editingAgent) {
        // PUT
        res = await fetch(`${API_BASE}/api/admin/agents.php`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAgent.id, ...formData })
        });
      } else {
        // POST
        if (!formData.password) { showToast('Password is required.', 'error'); setSaving(false); return; }
        res = await fetch(`${API_BASE}/api/admin/agents.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Done!');
        setIsModalOpen(false);
        fetchAgents();
      } else {
        showToast(data.message || 'Something went wrong.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    }
    setSaving(false);
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (agent) => {
    if (!window.confirm(`Remove "${agent.name}" as a Delivery Agent? Their active orders will be unassigned.`)) return;
    try {
      const res  = await fetch(`${API_BASE}/api/admin/agents.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agent.id })
      });
      const data = await res.json();
      if (res.ok) { showToast(data.message); fetchAgents(); }
      else showToast(data.message || 'Delete failed.', 'error');
    } catch {
      showToast('Network error.', 'error');
    }
  };

  // ── Filter + Paginate ────────────────────────────────────
  const filtered  = agents.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const total       = filtered.length;
  const paginated   = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status) =>
    status === 'Active'
      ? <span className="status-badge success">Active</span>
      : <span className="status-badge warning">Inactive</span>;

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="page-container" style={{ maxWidth: 1000 }}>

      {/* Toast */}
      {toast.show && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : '#16a34a',
          color: '#fff', padding: '12px 20px', borderRadius: 12,
          fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          animation: 'fadeSlideIn 0.3s ease'
        }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery Agents</h1>
          <p className="page-subtitle">Add, edit, or remove delivery boy accounts. They log in via the Delivery App.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={fetchAgents} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} /> Add Delivery Boy
          </button>
        </div>
      </div>

      <div className="data-card glass">
        <div className="data-toolbar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{total} agent{total !== 1 ? 's' : ''}</span>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading agents...</div>
          ) : paginated.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Bike size={40} color="#d1fae5" style={{ marginBottom: 10 }} />
              <p style={{ color: 'var(--text-muted)' }}>No delivery agents found.</p>
              <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={openAddModal}>
                <Plus size={16} /> Add First Agent
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(agent => (
                  <tr key={agent.id}>
                    <td>
                      <div className="product-cell">
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #16a34a, #15803d)',
                          color: '#fff', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0
                        }}>
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="product-name">{agent.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Shield size={11} color="var(--brand-primary)" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivery Agent</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><span className="cell-text">{agent.email}</span></td>
                    <td><span className="cell-text">{agent.phone || '—'}</span></td>
                    <td>{getStatusBadge(agent.status)}</td>
                    <td><span className="cell-text">{new Date(agent.created_at).toLocaleDateString('en-IN')}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn-small" onClick={() => openEditModal(agent)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn-small delete" onClick={() => handleDelete(agent)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {total > itemsPerPage && (
          <Pagination currentPage={currentPage} totalItems={total} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAgent ? `Edit: ${editingAgent.name}` : 'Add New Delivery Boy'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" className="form-input" required placeholder="e.g. Raju Kumar"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" className="form-input" required placeholder="e.g. raju@freshcart.com"
              disabled={!!editingAgent}
              style={editingAgent ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            {editingAgent && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Email cannot be changed after creation.</span>}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" className="form-input" placeholder="e.g. 9876543210"
              value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>

          <div className="form-group">
            <label>{editingAgent ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder={editingAgent ? 'Enter new password to reset...' : 'Min. 8 characters'}
                style={{ paddingRight: 42 }}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <button type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!editingAgent && (
              <div style={{ marginTop: 6, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, fontSize: '0.8rem', color: '#166534' }}>
                💡 The delivery boy will use this password to login at <strong>http://localhost:5175</strong>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Account Status</label>
            <select className="form-input filter-select"
              value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
              <option value="Active">✅ Active — Can accept deliveries</option>
              <option value="Inactive">🔴 Inactive — Cannot login</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingAgent ? '💾 Update Agent' : '🚴 Create Delivery Boy'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
