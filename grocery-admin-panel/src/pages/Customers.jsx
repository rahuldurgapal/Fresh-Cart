import React, { useState, useEffect } from 'react';
import { Search, Ban, Eye } from 'lucide-react';
import Pagination from '../components/Pagination';
import '../pages/Products.css'; // Reusing table styles

import API_BASE from '../config.js';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()));

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
              placeholder="Search by Name or Email..." 
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
                <th>Email</th>
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
                  <td><span className="cell-text">{customer.email}</span></td>
                  <td><span className="cell-text-bold">{customer.orders || 0}</span></td>
                  <td><span className="cell-text-bold">${Number(customer.spent || 0).toFixed(2)}</span></td>
                  <td>{getStatusBadge(customer.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn-small" title="View Profile"><Eye size={16} /></button>
                      <button className="icon-btn-small delete" title="Block User"><Ban size={16} /></button>
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
    </div>
  );
};

export default Customers;
