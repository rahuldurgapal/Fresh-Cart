import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Layers, Ticket, ShoppingCart, Users, BadgeCheck, Megaphone, MessageSquare, Settings, LogOut, Store, Bell } from 'lucide-react';
import './Sidebar.css';

import API_BASE from '../config.js';

const Sidebar = () => {
  const navigate = useNavigate();
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  // Poll for new Processing orders every 60s
  useEffect(() => {
    const fetchNewOrders = async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/orders/get_all.php`);
        const data = await res.json();
        if (data.records) {
          const processing = data.records.filter(o => o.status === 'Processing').length;
          setNewOrdersCount(processing);
        }
      } catch (e) {}
    };
    fetchNewOrders();
    const interval = setInterval(fetchNewOrders, 60000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard',   path: '/',          icon: <LayoutDashboard size={20} /> },
    { name: 'Products',    path: '/products',   icon: <Package size={20} /> },
    { name: 'Categories',  path: '/categories', icon: <Layers size={20} /> },
    { name: 'Coupons',     path: '/coupons',    icon: <Ticket size={20} /> },
    { name: 'Orders',      path: '/orders',     icon: <ShoppingCart size={20} /> },
    { name: 'Customers',   path: '/customers',  icon: <Users size={20} /> },
    { name: 'Staff Roles', path: '/staff',      icon: <BadgeCheck size={20} /> },
    { name: 'Marketing',   path: '/marketing',  icon: <Megaphone size={20} /> },
    { name: 'Reviews',     path: '/reviews',    icon: <MessageSquare size={20} /> },
    { name: 'Settings',    path: '/settings',   icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  // Get logged in admin name
  const admin = JSON.parse(localStorage.getItem('admin_user') || '{}');

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Store size={28} className="logo-icon" />
        <h2>FreshAdmin</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
            {item.name === 'Orders' && newOrdersCount > 0 && (
              <span style={{
                marginLeft: 'auto', background: '#ef4444', color: '#fff',
                fontSize: '0.7rem', fontWeight: 700, borderRadius: '10px',
                padding: '2px 7px', minWidth: '20px', textAlign: 'center'
              }}>
                {newOrdersCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {admin.name && (
          <div style={{
            padding: '10px 14px', marginBottom: '8px',
            background: 'rgba(34,197,94,0.08)', borderRadius: '10px',
            fontSize: '0.78rem', color: '#9ca3af'
          }}>
            <div style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.85rem' }}>{admin.name}</div>
            <div>{admin.role}</div>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
