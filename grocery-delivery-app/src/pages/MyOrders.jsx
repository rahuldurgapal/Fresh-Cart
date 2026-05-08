import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config.js';
import { MapPin, Package, IndianRupee, ChevronRight, ShoppingBag } from 'lucide-react';

const badgeClass = (status) => {
    if (status === 'Out for Delivery') return 'badge badge-delivering';
    if (status === 'Delivered') return 'badge badge-delivered';
    return 'badge badge-processing';
};

const MyOrders = () => {
    const { agent } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE}/api/delivery/get_my_orders.php`, {
            headers: { 'Authorization': `Bearer ${agent.token}` }
        })
        .then(r => r.json())
        .then(data => { setOrders(data.records || []); setLoading(false); })
        .catch(() => setLoading(false));
    }, [agent.token]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    return (
        <div className="page-wrapper">
            <h1 className="page-title">My Orders</h1>
            <p className="page-subtitle">All orders assigned to you</p>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading...</div>
            ) : orders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <ShoppingBag size={48} color="#d1fae5" style={{ marginBottom: '12px' }} />
                    <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>No assigned orders</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>Go to "Available" tab to accept deliveries</p>
                    <button className="btn-primary" onClick={() => navigate('/available')}>Browse Available Orders</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orders.map(order => (
                        <div
                            key={order.id}
                            className="card"
                            style={{ padding: '16px', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                            onClick={() => navigate(`/order/${order.id}`)}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>ORD-{order.id}</div>
                                    <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '2px' }}>{order.customer_name}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className={badgeClass(order.status)}>{order.status}</span>
                                    <ChevronRight size={18} color="#9ca3af" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#f9fafb', padding: '8px 10px', borderRadius: '8px', marginBottom: '8px' }}>
                                <MapPin size={14} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div style={{ fontSize: '0.82rem', color: '#374151' }}>
                                    {order.street_address}, {order.city}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.8rem' }}>
                                    <Package size={13} />{order.total_items} items
                                </div>
                                <div style={{ fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.95rem' }}>
                                    <IndianRupee size={14} />{Number(order.final_total).toFixed(0)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
