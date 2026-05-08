import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config.js';
import { Package, CheckCircle, Bike, Star } from 'lucide-react';

const Dashboard = () => {
    const { agent } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/api/delivery/get_dashboard.php`, {
            headers: { 'Authorization': `Bearer ${agent.token}` }
        })
        .then(r => r.json())
        .then(data => { setStats(data); setLoading(false); })
        .catch(() => setLoading(false));
    }, []);

    const statCards = stats ? [
        { label: "Today's Orders", value: stats.today_assigned, icon: <Package size={24} color="#16a34a" />, bg: '#dcfce7' },
        { label: "Delivered Today", value: stats.today_delivered, icon: <CheckCircle size={24} color="#2563eb" />, bg: '#dbeafe' },
        { label: "Active Deliveries", value: stats.active_orders, icon: <Bike size={24} color="#d97706" />, bg: '#fef3c7' },
        { label: "Total Delivered", value: stats.total_delivered, icon: <Star size={24} color="#7c3aed" />, bg: '#ede9fe' },
    ] : [];

    return (
        <div className="page-wrapper">
            <h1 className="page-title" style={{ marginTop: '4px' }}>Dashboard</h1>
            <p className="page-subtitle">Your delivery overview for today</p>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading stats...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
                        {statCards.map((card, i) => (
                            <div key={i} className="card" style={{ padding: '18px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                                    {card.icon}
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, marginBottom: '4px' }}>{card.value}</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>{card.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Quick Actions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button className="btn-primary" onClick={() => navigate('/available')}>
                            🛒  View Available Orders
                        </button>
                        <button className="btn-outline" onClick={() => navigate('/my-orders')}>
                            📦  My Assigned Orders
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
