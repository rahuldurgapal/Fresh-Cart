import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config.js';
import { MapPin, Phone, Package, ArrowLeft, CheckCircle, Bike, IndianRupee } from 'lucide-react';

const statusFlow = {
    'Out for Delivery': { next: 'Delivered', label: '✅ Mark as Delivered', color: '#16a34a' },
};

const OrderDetail = () => {
    const { id } = useParams();
    const { agent } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notes, setNotes] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetch(`${API_BASE}/api/delivery/get_my_orders.php`, {
            headers: { 'Authorization': `Bearer ${agent.token}` }
        })
        .then(r => r.json())
        .then(data => {
            const found = (data.records || []).find(o => String(o.id) === String(id));
            setOrder(found || null);
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }, [id, agent.token]);

    const handleUpdateStatus = async (newStatus) => {
        setUpdating(true);
        try {
            const res = await fetch(`${API_BASE}/api/delivery/update_status.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${agent.token}` },
                body: JSON.stringify({ order_id: parseInt(id), status: newStatus, notes })
            });
            const data = await res.json();
            if (res.ok) {
                setOrder(prev => ({ ...prev, status: newStatus }));
                setToast(`✅ Status updated to "${newStatus}"!`);
                setTimeout(() => setToast(''), 3000);
            } else {
                setToast(`❌ ${data.message}`);
                setTimeout(() => setToast(''), 3000);
            }
        } catch {
            setToast('❌ Network error.');
            setTimeout(() => setToast(''), 3000);
        }
        setUpdating(false);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>Loading order details...</div>;
    if (!order) return (
        <div className="page-wrapper" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '12px' }}>Order not found</h2>
            <button className="btn-outline" style={{ maxWidth: '200px', margin: '0 auto' }} onClick={() => navigate('/my-orders')}>Go Back</button>
        </div>
    );

    const action = statusFlow[order.status];

    return (
        <div className="page-wrapper">
            {toast && (
                <div style={{
                    position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
                    background: '#111827', color: '#fff', padding: '12px 24px', borderRadius: '12px',
                    zIndex: 1000, fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    whiteSpace: 'nowrap'
                }}>{toast}</div>
            )}

            <button
                onClick={() => navigate('/my-orders')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#16a34a', fontWeight: 600, fontSize: '0.95rem', marginBottom: '16px', padding: 0 }}
            >
                <ArrowLeft size={18} /> Back to My Orders
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h1 className="page-title" style={{ margin: 0 }}>ORD-{order.id}</h1>
                <span className={`badge ${order.status === 'Delivered' ? 'badge-delivered' : order.status === 'Out for Delivery' ? 'badge-delivering' : 'badge-processing'}`}>
                    {order.status}
                </span>
            </div>

            {/* Customer Info */}
            <div className="card" style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Customer</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>{order.customer_name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.85rem' }}>
                            <Phone size={13} />{order.customer_phone || 'N/A'}
                        </div>
                    </div>
                    {order.customer_phone && (
                        <a href={`tel:${order.customer_phone}`} style={{
                            background: '#dcfce7', color: '#16a34a', padding: '10px 18px', borderRadius: '10px',
                            textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            <Phone size={16} /> Call
                        </a>
                    )}
                </div>
            </div>

            {/* Delivery Address */}
            <div className="card" style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Delivery Address</div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '36px', height: '36px', background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={18} color="#d97706" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{order.street_address}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '2px' }}>{order.city} - {order.zip_code}</div>
                    </div>
                </div>
                <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${order.street_address}, ${order.city} ${order.zip_code}`)}`}
                    target="_blank" rel="noreferrer"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        marginTop: '14px', padding: '10px', background: '#1e40af', color: '#fff',
                        borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem'
                    }}
                >
                    🗺️ Open in Google Maps
                </a>
            </div>

            {/* Order Items */}
            <div className="card" style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Order Items</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Package size={16} color="#16a34a" />
                    <span style={{ fontSize: '0.9rem', color: '#374151' }}>{order.item_names}</span>
                </div>
                <div className="divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontWeight: 600 }}>Order Total</span>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <IndianRupee size={16} />{Number(order.final_total).toFixed(2)}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Payment</span>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: order.payment_method === 'COD' ? '#d97706' : '#16a34a' }}>
                        {order.payment_method === 'COD' ? '💵 Collect Cash' : '✅ Already Paid (Online)'}
                    </span>
                </div>
            </div>

            {/* Status Update */}
            {action && order.status !== 'Delivered' && (
                <div className="card" style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Update Status</div>
                    <div style={{ marginBottom: '12px' }}>
                        <label>Add a note (optional)</label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="e.g., Left at door, Customer not available..."
                            style={{ resize: 'none' }}
                        />
                    </div>
                    <button
                        className="btn-primary"
                        disabled={updating}
                        onClick={() => handleUpdateStatus(action.next)}
                        style={{ background: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1.05rem' }}
                    >
                        {updating ? <><span className="spinner"></span>Updating...</> : action.label}
                    </button>
                </div>
            )}

            {order.status === 'Delivered' && (
                <div className="card" style={{ textAlign: 'center', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <CheckCircle size={40} color="#16a34a" style={{ marginBottom: '8px' }} />
                    <h3 style={{ color: '#16a34a', fontWeight: 700 }}>Order Delivered!</h3>
                    {order.delivery_notes && <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '6px' }}>Note: {order.delivery_notes}</p>}
                </div>
            )}
        </div>
    );
};

export default OrderDetail;
