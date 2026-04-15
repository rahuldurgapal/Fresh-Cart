import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="admin-header glass">
      <div className="header-search">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search anything..." />
      </div>

      <div className="header-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="admin-profile">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="profile-info">
            <span className="profile-name">Rahul Dev</span>
            <span className="profile-role">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
