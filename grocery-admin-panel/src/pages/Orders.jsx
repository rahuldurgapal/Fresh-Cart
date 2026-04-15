import React, { useState, useEffect } from 'react';
import { Search, Eye, Download } from 'lucide-react';
import Pagination from '../components/Pagination';
import '../pages/Products.css'; // Reusing the layout and table styles

import API_BASE from '../config.js';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Delivered': return <span className="status-badge success">{status}</span>;
      case 'Processing': return <span className="status-badge warning">{status}</span>;
      case 'Cancelled': return <span className="status-badge danger">{status}</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  const fetchOrders = async () => {
     try {
        const response = await fetch(`${API_BASE}/api/orders/get_all.php`);
        const data = await response.json();
        if(data.records) setOrders(data.records);
     } catch (e) {
        console.error(e);
     }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/update_status.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      if(response.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
     fetchOrders();
  }, []);

  const exportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Date', 'Total', 'Status', 'Payment'];
    const rows = orders.map(o => [
      `ORD-${o.id}`, o.customer_name,
      new Date(o.created_at).toLocaleString('en-IN'),
      o.final_total, o.status, o.payment_method
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.setAttribute('download', `orders_${Date.now()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => o.id.toString().includes(searchTerm) || o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Pagination Logic
  const totalItems = filteredOrders.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Track, manage, and fulfill customer orders.</p>
        </div>
        <button className="btn btn-secondary" onClick={exportCSV}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="data-card glass">
        <div className="data-toolbar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="toolbar-filters">
            <select className="filter-select">
              <option value="all">Any Status</option>
              <option value="delivered">Delivered</option>
              <option value="processing">Processing</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select className="filter-select">
              <option value="all">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="thismonth">This Month</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total Amout</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id}>
                  <td><span className="cell-text-bold">ORD-{order.id}</span></td>
                  <td>
                    <div className="product-cell">
                      <div className="avatar" style={{width: 32, height: 32, fontSize: '0.8rem'}}>
                        {order.customer_name.charAt(0)}
                      </div>
                      <span className="product-name">{order.customer_name}</span>
                    </div>
                  </td>
                  <td><span className="cell-text">{new Date(order.created_at).toLocaleDateString()}</span></td>
                  <td><span className="cell-text">{order.total_items || 0}</span></td>
                  <td><span className="cell-text-bold">${Number(order.final_total).toFixed(2)}</span></td>
                  <td>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{
                        padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border)',
                        background: 'var(--card-bg)', color: 'var(--text-dark)', cursor: 'pointer', fontSize: '0.85rem'
                      }}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn-small" title="View Details"><Eye size={16} /></button>
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

export default Orders;
