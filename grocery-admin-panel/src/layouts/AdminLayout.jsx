import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout = () => {
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-container">
      {/* Mobile Overlay Backdrop */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={closeSidebar}
      ></div>

      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <div className="main-content">
        <Header 
          globalSearchTerm={globalSearchTerm} 
          setGlobalSearchTerm={setGlobalSearchTerm}
          toggleSidebar={toggleSidebar} 
        />
        <main className="content-wrapper" style={{ padding: '2rem' }}>
          <Outlet context={{ globalSearchTerm }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
