import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Shield } from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import '../pages/Products.css';

const dummyStaff = [
  { id: '1', name: 'Rahul Dev', email: 'rahul@freshadmin.com', role: 'Super Admin', status: 'Active' },
  { id: '3', name: 'Vikas Kumar', email: 'vikas@freshadmin.com', role: 'Delivery Agent', status: 'Active' },
];

const Staff = () => {
  const [staffList, setStaffList] = useState(dummyStaff);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Delivery Agent', status: 'Active' });

  const getStatusBadge = (status) => {
    return status === 'Active' 
      ? <span className="status-badge success">Active</span> 
      : <span className="status-badge warning">Inactive</span>;
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', role: 'Delivery Agent', status: 'Active' });
    setIsModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingId(staff.id);
    setFormData({ ...staff });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this team member?")) {
      setStaffList(staffList.filter(s => s.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setStaffList(staffList.map(s => s.id === editingId ? { ...s, ...formData } : s));
    } else {
      setStaffList([...staffList, { ...formData, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
  };

  const filteredStaff = staffList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Pagination Logic
  const totalItems = filteredStaff.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="page-container" style={{ maxWidth: 1000 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Staff & Delivery Agents</h1>
          <p className="page-subtitle">Manage access for the Store Owner and Delivery Boys.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Invite Staff
        </button>
      </div>

      <div className="data-card glass">
        <div className="data-toolbar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search team members by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStaff.map((staff) => (
                <tr key={staff.id}>
                  <td>
                    <div className="product-cell">
                      <div className="avatar" style={{width: 36, height: 36, fontSize: '0.9rem', backgroundColor: '#e2e8f0', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'}}>
                        {staff.name.charAt(0)}
                      </div>
                      <span className="product-name">{staff.name}</span>
                    </div>
                  </td>
                  <td><span className="cell-text">{staff.email}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={14} color="var(--brand-primary)" />
                      <span className="cell-text-bold">{staff.role}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(staff.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn-small" onClick={() => openEditModal(staff)}><Edit2 size={16} /></button>
                      <button className="icon-btn-small delete" onClick={() => handleDelete(staff.id)} disabled={staff.role === 'Super Admin'}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalItems > itemsPerPage && (
          <Pagination 
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Modify Staff Access" : "Invite New Staff"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Work Email</label>
            <input 
              type="email" 
              className="form-input" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>System Role & Permissions</label>
            <select 
              className="form-input filter-select" 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="Super Admin">Store Owner (Dashboard & Operations)</option>
              <option value="Delivery Agent">Delivery Boy (Active Orders Only)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Account Status</label>
            <select 
              className="form-input filter-select" 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Suspended / Inactive</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update Access" : "Invite User"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
