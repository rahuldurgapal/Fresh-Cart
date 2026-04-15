import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import API_BASE from '../config.js';

const MyOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (user?.id) fetchOrders();
    else setLoading(false);
  }, [user]);

  // Polling for active orders (Status: Processing or Out for Delivery)
  useEffect(() => {
    let interval;
    const hasActiveOrders = orders.some(o => o.status === 'Processing' || o.status === 'Out for Delivery');

    if (hasActiveOrders && user?.id) {
      interval = setInterval(() => {
        fetchOrders();
      }, 20000); // 20 seconds
    }

    return () => clearInterval(interval);
  }, [orders, user]);

  const fetchOrders = async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/orders/get_by_user.php?user_id=${user.id}`);
      const data = await res.json();
      if (data.records) setOrders(data.records);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Processing':       return { icon: <Clock size={16} />,       color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
      case 'Out for Delivery': return { icon: <Truck size={16} />,       color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
      case 'Delivered':        return { icon: <CheckCircle size={16} />, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
      case 'Cancelled':        return { icon: <XCircle size={16} />,     color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
      default: return { icon: null, color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <ShoppingBag size={56} color="#d1fae5" />
        <h2 style={{ color: 'var(--text-dark)', fontSize: '1.4rem' }}>Please login to view your orders</h2>
        <Link to="/login" style={{ padding: '10px 28px', background: '#22c55e', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>
          Login
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 16px', minHeight: '70vh' }}>
      <button onClick={() => navigate(-1)} className="back-btn">
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', margin: '0 0 6px' }}>
          My Orders
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Track and manage your order history</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <ShoppingBag size={64} style={{ color: '#d1fae5', marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--text-dark)', fontSize: '1.3rem', margin: '0 0 8px' }}>No orders yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Start shopping to place your first order!</p>
          <Link to="/" style={{ padding: '10px 28px', background: '#22c55e', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>
            Shop Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => {
            const st        = getStatusConfig(order.status);
            const isExpanded = expandedId === order.id;
            return (
              <div key={order.id} style={{
                background: 'var(--card-bg)', border: '1px solid var(--border)',
                borderRadius: '16px', overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s'
              }}>
                {/* Order Header */}
                <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #bbf7d0, #d1fae5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={20} color="#16a34a" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem' }}>Order #ORD-{order.id}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '5px 12px', borderRadius: '20px',
                      background: st.bg, color: st.color,
                      fontSize: '0.82rem', fontWeight: 600
                    }}>
                      {st.icon} {order.status}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)' }}>
                      ₹{Number(order.final_total).toFixed(2)}
                    </span>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: 'rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-dark)' }}>{order.item_names}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery To</div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-dark)' }}>{order.street_address}, {order.city}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment</div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-dark)' }}>{order.payment_method} · {order.payment_status}</div>
                      </div>
                      {order.coupon_code && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coupon Used</div>
                          <div style={{ fontSize: '0.88rem', color: '#22c55e', fontWeight: 600 }}>🏷️ {order.coupon_code}</div>
                        </div>
                      )}
                    </div>
                    <Link to={`/order-tracking/${order.id}`} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600
                    }}>
                      <Truck size={14} /> Track Order
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
