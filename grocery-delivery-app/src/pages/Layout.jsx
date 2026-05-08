import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingBag, ListOrdered, LogOut, Bell, X } from 'lucide-react';
import API_BASE from '../config.js';
import { useState, useEffect } from 'react';

const Layout = ({ children }) => {
    const { agent, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotif, setShowNotif] = useState(false);

    // Sound effect - Long beep for Delivery Agent
    const playSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.loop = true;
        audio.play().catch(e => console.log("Audio play blocked. Click anywhere to enable."));
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
        }, 8000); // 8 seconds loop
    };

    const fetchNotifications = async () => {
        if (!agent) return;
        try {
            const res = await fetch(`${API_BASE}/api/notifications/notifications.php?role=Delivery Agent&agent_id=${agent.id}&unread=1`);
            const data = await res.json();
            if (data.records) {
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
            fetchNotifications(); // Refresh on error
        }
    };

    const markAllAsRead = async () => {
        try {
            // Optimistic Update
            setUnreadCount(0);
            setNotifications([]);
            setShowNotif(false);

            await fetch(`${API_BASE}/api/notifications/notifications.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'Delivery Agent', agent_id: agent.id, mark_all: true })
            });
        } catch (error) {
            console.error("Error marking as read:", error);
            fetchNotifications(); // Refresh on error
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [agent, unreadCount]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navStyle = (isActive) => ({
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        padding: '8px 16px', borderRadius: '10px', textDecoration: 'none',
        color: isActive ? '#16a34a' : '#6b7280',
        background: isActive ? '#dcfce7' : 'transparent',
        transition: 'all 0.2s', fontSize: '0.7rem', fontWeight: 600,
    });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top Header */}
            <header style={{
                background: '#16a34a', color: '#fff', padding: '14px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 100,
                boxShadow: '0 2px 12px rgba(22,163,74,0.3)'
            }}>
                <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>🚴 FreshCart</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Hey, {agent?.name?.split(' ')[0]}! 👋</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowNotif(!showNotif)}
                            style={{
                                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                                borderRadius: '10px', padding: '8px', display: 'flex', alignItems: 'center',
                                cursor: 'pointer', position: 'relative'
                            }}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-4px', right: '-4px',
                                    background: '#ef4444', color: '#fff', fontSize: '10px',
                                    fontWeight: 'bold', minWidth: '16px', height: '16px',
                                    borderRadius: '8px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', border: '2px solid #16a34a'
                                }}>{unreadCount}</span>
                            )}
                        </button>

                        {showNotif && (
                            <div style={{
                                position: 'fixed', top: '70px', left: '10px', right: '10px',
                                background: '#fff', borderRadius: '16px', color: '#333',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 1000,
                                maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                                animation: 'slideDown 0.3s ease'
                            }}>
                                <div style={{
                                    padding: '16px', borderBottom: '1px solid #eee',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: '#f9fafb'
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Notifications</h3>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={markAllAsRead} style={{
                                            background: 'none', border: 'none', color: '#16a34a',
                                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                                        }}>Mark all read</button>
                                        <button onClick={() => setShowNotif(false)} style={{
                                            background: 'none', border: 'none', color: '#666', cursor: 'pointer'
                                        }}><X size={18} /></button>
                                    </div>
                                </div>
                                <div style={{ overflowY: 'auto', flex: 1 }}>
                                    {notifications.filter(n => n.is_read == 0).length === 0 ? (
                                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
                                            No new notifications
                                        </div>
                                    ) : (
                                        notifications.filter(n => n.is_read == 0).map(n => (
                                            <div 
                                                key={n.id} 
                                                onClick={() => markAsRead(n.id)}
                                                style={{
                                                    padding: '16px', borderBottom: '1px solid #eee',
                                                    background: '#f0fdf4',
                                                    display: 'flex', gap: '12px',
                                                    cursor: 'pointer'
                                                }}
                                                title="Click to clear"
                                            >
                                                <div style={{ fontSize: '1.2rem' }}>
                                                    {n.type === 'order_available' ? '📦' : '🚴'}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '2px' }}>{n.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.4 }}>{n.message}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '4px' }}>
                                                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                            borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center',
                            gap: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            {/* Page Content */}
            <main style={{ flex: 1, overflowY: 'auto' }}>
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: '#fff', borderTop: '1px solid #e5e7eb',
                padding: '8px 16px', display: 'flex', justifyContent: 'space-around',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', zIndex: 100
            }}>
                <NavLink to="/dashboard" style={({ isActive }) => navStyle(isActive)}>
                    <LayoutDashboard size={22} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/available" style={({ isActive }) => navStyle(isActive)}>
                    <ShoppingBag size={22} />
                    <span>Available</span>
                </NavLink>
                <NavLink to="/my-orders" style={({ isActive }) => navStyle(isActive)}>
                    <ListOrdered size={22} />
                    <span>My Orders</span>
                </NavLink>
            </nav>
        </div>
    );
};

export default Layout;
