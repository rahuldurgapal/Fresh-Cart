import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import './Header.css';
import API_BASE from '../config.js';

const Header = ({ globalSearchTerm, setGlobalSearchTerm, toggleSidebar }) => {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sound effect - Long beep for Admin
  const playSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.loop = true;
    audio.play().catch(e => console.log("Audio play blocked. Click anywhere to enable."));
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 8000); // Play for 8 seconds
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/notifications.php?role=Admin&unread=1`);
      const data = await res.json();
      if (data.records) {
        // If unread count increased, play sound
        if (data.unread_count > unreadCount) {
          playSound();
        }
        setNotifications(data.records);
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/get_all.php`);
      const data = await response.json();
      if (data.records) {
        const pending = data.records.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
        setPendingOrdersCount(pending);
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      // Optimistic Update
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));

      await fetch(`${API_BASE}/api/notifications/notifications.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (error) {
      console.error("Error marking as read:", error);
      fetchNotifications(); // Revert on error
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic Update
      setUnreadCount(0);
      setNotifications([]);
      setShowNotifications(false); // Close dropdown after clearing

      await fetch(`${API_BASE}/api/notifications/notifications.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'Admin', mark_all: true })
      });
    } catch (error) {
      console.error("Error marking as read:", error);
      fetchNotifications(); // Revert on error
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchPendingOrders();
      fetchNotifications();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [unreadCount]);

  return (
    <header className="admin-header glass">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="header-search">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            value={globalSearchTerm || ''}
            onChange={(e) => setGlobalSearchTerm && setGlobalSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="header-actions">
        <div className="notification-wrapper">
          <button className={`icon-btn ${showNotifications ? 'active' : ''}`} onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown glass fade-in">
              <div className="notif-header">
                <h3>Notifications</h3>
                <button onClick={markAllAsRead}>Mark all as read</button>
              </div>
              <div className="notif-list">
                {notifications.filter(n => n.is_read == 0).length === 0 ? (
                  <p className="no-notif">No new notifications</p>
                ) : (
                  notifications.filter(n => n.is_read == 0).map(n => (
                    <div 
                      key={n.id} 
                      className="notif-item unread" 
                      onClick={() => markAsRead(n.id)}
                      title="Click to clear"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="notif-icon">
                        {n.type === 'new_order' && '🛒'}
                        {n.type === 'order_accepted' && '🚴'}
                        {n.type === 'order_delivered' && '✅'}
                      </div>
                      <div className="notif-content">
                        <p className="notif-title">{n.title}</p>
                        <p className="notif-msg">{n.message}</p>
                        <span className="notif-time">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="admin-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="profile-info mobile-hidden">
            <span className="profile-name">Rahul Dev</span>
            <span className="profile-role">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
