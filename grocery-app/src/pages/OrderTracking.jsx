import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { CheckCircle, Clock, Truck, Package, MapPin, Phone, ShoppingBag } from 'lucide-react';

import API_BASE from '../config.js';

const steps = [
  { key: 'Processing',       label: 'Order Placed',        icon: <ShoppingBag size={20} />,  desc: 'Order confirmed & being packed' },
  { key: 'Out for Delivery', label: 'Out for Delivery',    icon: <Truck size={20} />,         desc: 'Your order is on the way' },
  { key: 'Delivered',        label: 'Delivered',           icon: <CheckCircle size={20} />,   desc: 'Order delivered successfully' },
];

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Polling for order status updates
  useEffect(() => {
    let interval;
    if (order && order.status !== 'Delivered' && order.status !== 'Cancelled') {
      interval = setInterval(() => {
        fetchOrder();
      }, 10000); // 10 seconds
    }
    return () => clearInterval(interval);
  }, [order]);

  const fetchOrder = async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/orders/get_single.php?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setError('Order not found.');
      }
    } catch (e) {
      setError('Failed to load order.');
    }
    setLoading(false);
  };

  const getCurrentStep = (status) => {
    if (status === 'Delivered')        return 2;
    if (status === 'Out for Delivery') return 1;
    if (status === 'Cancelled')        return -1;
    return 0; // Processing
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading order details...</div>;
  if (error)   return (
    <div style={{ padding: '60px', textAlign: 'center' }}>
      <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
      <Link to="/my-orders" style={{ color: '#22c55e' }}>← Back to Orders</Link>
    </div>
  );

  const currentStep = getCurrentStep(order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px', minHeight: '70vh' }}>
      <button onClick={() => navigate(-1)} className="back-btn">
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link to="/my-orders" style={{ color: '#22c55e', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>
            ← Back to My Orders
          </Link>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--text-dark)', margin: '0 0 4px' }}>
            Order #ORD-{order.id}
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span style={{
          padding: '6px 16px', borderRadius: '20px', fontWeight: 600, fontSize: '0.875rem',
          background: isCancelled ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
          color: isCancelled ? '#ef4444' : '#22c55e'
        }}>
          {order.status}
        </span>
      </div>

      {/* Tracking Progress */}
      {!isCancelled ? (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '28px' }}>
            Tracking Progress
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress Line */}
            <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '3px', background: '#e5e7eb', borderRadius: '2px' }}>
              <div style={{
                height: '100%', background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                borderRadius: '2px', width: `${Math.min(100, (currentStep / (steps.length - 1)) * 100)}%`,
                transition: 'width 0.8s ease'
              }} />
            </div>
            {steps.map((step, idx) => {
              const done    = idx <= currentStep;
              const active  = idx === currentStep;
              return (
                <div key={step.key} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#e5e7eb',
                    color: done ? '#fff' : '#9ca3af',
                    boxShadow: active ? '0 0 0 4px rgba(34,197,94,0.2)' : 'none',
                    transition: 'all 0.4s ease'
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ fontWeight: done ? 600 : 400, color: done ? 'var(--text-dark)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ color: '#ef4444', fontWeight: 600, margin: 0 }}>This order was cancelled.</p>
        </div>
      )}

      {/* Order Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Delivery Info */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="#22c55e" /> Delivery Address
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 6px' }}>{order.street_address}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 6px' }}>{order.city} - {order.zip_code}</p>
          <p style={{ color: 'var(--text-dark)', fontSize: '0.88rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={13} /> {order.phone_number}
          </p>
        </div>

        {/* Payment Info */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '14px' }}>Payment Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Method</span>
            <span style={{ color: 'var(--text-dark)', fontSize: '0.88rem', fontWeight: 500 }}>{order.payment_method}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Status</span>
            <span style={{ color: 'var(--text-dark)', fontSize: '0.88rem', fontWeight: 500 }}>{order.payment_status}</span>
          </div>
          {order.coupon_code && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Coupon</span>
              <span style={{ color: '#22c55e', fontSize: '0.88rem', fontWeight: 600 }}>🏷️ {order.coupon_code}</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>Total Paid</span>
            <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '1.05rem' }}>₹{Number(order.final_total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={16} color="#22c55e" /> Order Items
        </h3>
        {order.items?.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
              {item.image_path ? (
                <img src={`${API_BASE}${item.image_path}`} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={18} color="#9ca3af" />
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{item.product_name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Qty: {item.quantity}</div>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>₹{Number(item.unit_price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTracking;
