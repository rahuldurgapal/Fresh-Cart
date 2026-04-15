import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Ticket } from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import '../pages/Products.css';
import Toast from '../components/Toast';

import API_BASE from '../config.js';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ code: '', discount_type: 'Flat', discount_value: '', min_order: '', status: 'Active' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const getStatusBadge = (status) => {
    return status === 'Active' 
      ? <span className="status-badge success">Active</span> 
      : <span className="status-badge warning">Expired</span>;
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ code: '', discount_type: 'Flat', discount_value: '', min_order: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingId(coupon.id);
    setFormData({ ...coupon });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this promo code?")) {
      try {
        const response = await fetch(`${API_BASE}/api/coupons/delete.php?id=${id}`, {
          method: 'DELETE'
        });
        if(response.ok) {
          setToast({ show: true, message: 'Coupon deleted!', type: 'success' });
          fetchCoupons();
        } else {
          const err = await response.json();
          setToast({ show: true, message: err.message || 'Failed to delete coupon.', type: 'error' });
        }
      } catch(e) { console.error(e); }
    }
  };

  const fetchCoupons = async () => {
     try {
         const response = await fetch(`${API_BASE}/api/coupons/get.php`);
         const data = await response.json();
         if(data.records) setCoupons(data.records);
     } catch(e) { console.error(e); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      try {
        const payload = {
          id: editingId,
          code: formData.code,
          discount_type: formData.discount_type,
          discount_value: parseFloat(formData.discount_value),
          min_order: parseFloat(formData.min_order || 0),
          status: formData.status
        };
        const response = await fetch(`${API_BASE}/api/coupons/update.php`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if(response.ok) {
          setToast({ show: true, message: 'Coupon updated successfully!', type: 'success' });
          fetchCoupons();
          setIsModalOpen(false);
        } else {
          const err = await response.json();
          alert(err.message || 'Failed to update coupon');
        }
      } catch(e) { console.error(e); alert('Network Error'); }
    } else {
       try {
          const payload = {
            code: formData.code,
            discount_type: formData.discount_type,
            discount_value: parseFloat(formData.discount_value),
            min_order: parseFloat(formData.min_order || 0),
            status: formData.status
          };

          const response = await fetch(`${API_BASE}/api/coupons/create.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if(response.ok) {
            setToast({ show: true, message: 'New Coupon generated successfully!', type: 'success' });
            fetchCoupons();
            setIsModalOpen(false);
          } else {
            const err = await response.json();
            alert(err.message || 'Failed to create coupon');
          }
       } catch (error) {
          console.error(error);
          alert('Network Error');
       }
    }
  };

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()));

  // Pagination Logic
  const totalItems = filteredCoupons.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCoupons = filteredCoupons.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Coupons & Promos</h1>
          <p className="page-subtitle">Generate and manage promotional discount codes.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Create Promo
        </button>
      </div>

      <div className="data-card glass">
        <div className="data-toolbar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search promo codes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min. Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCoupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    <div className="product-cell">
                      <div className="avatar" style={{width: 32, height: 32, backgroundColor: '#f1f5f9', color: 'var(--brand-primary)', borderRadius: '4px'}}>
                        <Ticket size={16} />
                      </div>
                      <span className="cell-text-bold" style={{letterSpacing: '1px', color: 'var(--brand-primary)'}}>{coupon.code}</span>
                    </div>
                  </td>
                  <td><span className="cell-text">{coupon.discount_type}</span></td>
                  <td><span className="cell-text-bold">{coupon.discount_type === 'Flat' ? `$${coupon.discount_value}` : `${coupon.discount_value}%`}</span></td>
                  <td><span className="cell-text">${Number(coupon.min_order).toFixed(2)}</span></td>
                  <td>{getStatusBadge(coupon.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn-small" onClick={() => openEditModal(coupon)}><Edit2 size={16} /></button>
                      <button className="icon-btn-small delete" onClick={() => handleDelete(coupon.id)}><Trash2 size={16} /></button>
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
        title={editingId ? "Edit Promo Code" : "Create Promo Code"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Promo Code</label>
            <input 
              type="text" 
              className="form-input" 
              style={{textTransform: 'uppercase'}}
              required
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              placeholder="e.g. WELCOME50"
            />
          </div>

          <div className="form-group">
            <label>Discount Type</label>
            <select 
              className="form-input filter-select" 
              value={formData.discount_type}
              onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
            >
              <option value="Flat">Flat Amount ($)</option>
              <option value="Percentage">Percentage (%)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Discount Value</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                className="form-input" 
                required
                value={formData.discount_value}
                onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label>Minimum Order Amount ($)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                className="form-input" 
                required
                value={formData.min_order}
                onChange={(e) => setFormData({...formData, min_order: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select 
              className="form-input filter-select" 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Save Changes" : "Create Code"}
            </button>
          </div>
        </form>
      </Modal>

      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />}
    </div>
  );
};

export default Coupons;
