import React, { useState, useEffect } from 'react';
import { Search, Ban, Eye, CheckCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import '../pages/Products.css'; // Reusing table styles

import API_BASE from '../config.js';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { globalSearchTerm } = useOutletContext() || { globalSearchTerm: '' };
  
  // Modal & Toast State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active': return <span className="status-badge success">Active</span>;
      case 'Inactive': return <span className="status-badge warning">Inactive</span>;
      case 'Blocked': return <span className="status-badge danger">Blocked</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  const fetchCustomers = async () => {
      try {
          const response = await fetch(`${API_BASE}/api/users/get_customers.php`);
          const data = await response.json();
          if(data.records) setCustomers(data.records);
      } catch(e) { console.error(e); }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Blocked' : 'Active';
    try {
      const response = await fetch(`${API_BASE}/api/users/update_status.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: newStatus })
      });
      if(response.ok) {
        setToast({ show: true, message: `User ${newStatus.toLowerCase()} successfully`, type: 'success' });
        fetchCustomers();
      }
    } catch(e) { console.error(e); }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const filteredCustomers = customers.filter(c => {
    const currentSearch = searchTerm || globalSearchTerm || '';
    const phoneStr = c.phone || '';
    return c.name.toLowerCase().includes(currentSearch.toLowerCase()) || phoneStr.includes(currentSearch);
  });

  // Pagination Logic
  const totalItems = filteredCustomers.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage registered users and their account statuses.</p>
        </div>
      </div>

      <div className="data-card glass">
        <div className="data-toolbar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by Name or Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="toolbar-filters">
            <select className="filter-select">
              <option value="all">Any Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="product-cell">
                      <div className="avatar" style={{width: 36, height: 36, fontSize: '0.9rem', backgroundColor: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'}}>
                        {customer.name.charAt(0)}
                      </div>
                      <span className="product-name">{customer.name}</span>
                    </div>
                  </td>
                  <td><span className="cell-text">{customer.phone || 'N/A'}</span></td>
                  <td><span className="cell-text-bold">{customer.orders || 0}</span></td>
                  <td><span className="cell-text-bold">₹{Number(customer.spent || 0).toFixed(2)}</span></td>
                  <td>{getStatusBadge(customer.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn-small" title="View Profile" onClick={() => openUserModal(customer)}>
                        <Eye size={16} />
                      </button>
                      <button 
                        className={`icon-btn-small ${customer.status === 'Active' ? 'delete' : 'success'}`} 
                        title={customer.status === 'Active' ? 'Block User' : 'Unblock User'}
                        onClick={() => handleToggleStatus(customer)}
                      >
                        {customer.status === 'Active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                      </button>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Customer Details">
        {selectedUser && (
          <div className="customer-details">
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
               <div className="avatar" style={{width: 64, height: 64, fontSize: '1.5rem', backgroundColor: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'}}>
                 {selectedUser.name.charAt(0)}
               </div>
               <div>
                 <h2 style={{margin: '0 0 4px 0'}}>{selectedUser.name}</h2>
                 <p style={{margin: 0, color: 'var(--text-muted)'}}>{selectedUser.phone || 'N/A'}</p>
                 <div style={{marginTop: '8px'}}>{getStatusBadge(selectedUser.status)}</div>
               </div>
            </div>
            
            <div className="form-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <div className="info-box" style={{background: 'var(--bg-light)', padding: '16px', borderRadius: '8px'}}>
                 <span style={{display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)'}}>Total Orders</span>
                 <span style={{fontSize: '1.2rem', fontWeight: 600}}>{selectedUser.orders || 0}</span>
              </div>
              <div className="info-box" style={{background: 'var(--bg-light)', padding: '16px', borderRadius: '8px'}}>
                 <span style={{display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)'}}>Total Spent</span>
                 <span style={{fontSize: '1.2rem', fontWeight: 600}}>₹{Number(selectedUser.spent || 0).toFixed(2)}</span>
              </div>
              <div className="info-box" style={{background: 'var(--bg-light)', padding: '16px', borderRadius: '8px'}}>
                 <span style={{display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)'}}>Joined Date</span>
                 <span style={{fontSize: '1.1rem', fontWeight: 500}}>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />}
    </div>
  );
};

export default Customers;
