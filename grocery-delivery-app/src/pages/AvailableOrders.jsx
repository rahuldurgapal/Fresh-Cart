import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config.js';
import { MapPin, Package, IndianRupee, RefreshCw, CheckCircle } from 'lucide-react';

const AvailableOrders = () => {
    const { agent } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);
    const [toast, setToast] = useState('');
    const prevCountRef = React.useRef(0);

    const playNotification = () => {
        // High-pitched beep sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.loop = true; // Make it long
        audio.play().catch(e => console.log("Audio play failed:", e));
        
        // Stop after 8 seconds
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
        }, 8000);
    };

    const fetchOrders = useCallback((isPolling = false) => {
        if (!isPolling) setLoading(true);
        fetch(`${API_BASE}/api/delivery/get_unassigned.php`, {
            headers: { 'Authorization': `Bearer ${agent.token}` }
        })
        .then(r => r.json())
        .then(data => { 
            const newOrders = data.records || [];
            
            // If polling and new orders found, play sound
            if (isPolling && newOrders.length > prevCountRef.current) {
                playNotification();
                setToast('🔔 New orders available!');
                setTimeout(() => setToast(''), 4000);
            }
            
            prevCountRef.current = newOrders.length;
            setOrders(newOrders); 
            setLoading(false); 
        })
        .catch(() => setLoading(false));
    }, [agent.token]);

    useEffect(() => { 
        fetchOrders(); 
        
        // Poll every 15 seconds for new orders
        const interval = setInterval(() => {
            fetchOrders(true);
        }, 15000);

        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleAccept = async (orderId) => {
        setAccepting(orderId);
        try {
            const res = await fetch(`${API_BASE}/api/delivery/accept_order.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${agent.token}` },
                body: JSON.stringify({ order_id: orderId })
            });
            const data = await res.json();
            if (res.ok) {
                setToast('✅ Order accepted! Navigate to customer.');
                setTimeout(() => { setToast(''); navigate('/my-orders'); }, 1800);
            } else {
                setToast(`❌ ${data.message}`);
                setTimeout(() => setToast(''), 3000);
                fetchOrders();
            }
        } catch {
            setToast('❌ Network error. Try again.');
            setTimeout(() => setToast(''), 3000);
        }
        setAccepting(null);
    };

    return (
        <div className="page-wrapper">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h1 className="page-title">Available Orders</h1>
                <button onClick={fetchOrders} style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', padding: '4px' }}>
                    <RefreshCw size={20} />
                </button>
            </div>
            <p className="page-subtitle">Tap "Accept" to start a delivery</p>

            {toast && (
                <div style={{
                    position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
                    background: '#111827', color: '#fff', padding: '12px 24px', borderRadius: '12px',
                    zIndex: 1000, fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                }}>{toast}</div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <CheckCircle size={48} color="#d1fae5" style={{ marginBottom: '12px' }} />
                    <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>All caught up!</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No unassigned orders right now. Check back soon!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orders.map(order => (
                        <div key={order.id} className="card" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>ORD-{order.id}</div>
                                    <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '2px' }}>{order.customer_name}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                        <IndianRupee size={16} />{Number(order.final_total).toFixed(0)}
                                    </div>
                                    <span className="badge badge-processing" style={{ fontSize: '0.7rem' }}>{order.payment_method}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px' }}>
                                <MapPin size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.4 }}>
                                    {order.street_address}, {order.city} - {order.zip_code}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                <Package size={14} color="#9ca3af" />
                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{order.total_items} items · {order.item_names}</span>
                            </div>

                            <button
                                className="btn-primary"
                                disabled={accepting === order.id}
                                onClick={() => handleAccept(order.id)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {accepting === order.id ? <><span className="spinner"></span>Accepting...</> : '🚴 Accept Delivery'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AvailableOrders;
