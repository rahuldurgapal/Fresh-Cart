import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { CheckCircle, Clock, Truck, Package, MapPin, Phone, ShoppingBag, XCircle, User, RefreshCw, IndianRupee } from 'lucide-react';
import API_BASE from '../config.js';

// === STATUS STEPS DEFINITION ===
const STEPS = [
  {
    key:   'Processing',
    label: 'Order Confirmed',
    icon:  ShoppingBag,
    desc:  'Your order is confirmed and being packed',
    color: '#f59e0b',
    bg:    '#fef3c7',
  },
  {
    key:   'Out for Delivery',
    label: 'Out for Delivery',
    icon:  Truck,
    desc:  'Delivery partner is on the way to you',
    color: '#3b82f6',
    bg:    '#dbeafe',
  },
  {
    key:   'Delivered',
    label: 'Delivered',
    icon:  CheckCircle,
    desc:  'Order delivered successfully',
    color: '#22c55e',
    bg:    '#dcfce7',
  },
];

const getStepIndex = (status) => {
  if (status === 'Delivered')        return 2;
  if (status === 'Out for Delivery') return 1;
  return 0;
};

// === PULSING DOT ===
const PulseDot = ({ color }) => (
  <span style={{ position: 'relative', display: 'inline-flex', marginLeft: 6 }}>
    <span style={{
      position: 'absolute', display: 'inline-flex',
      width: 10, height: 10, borderRadius: '50%',
      background: color, opacity: 0.6,
      animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
    }} />
    <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-flex' }} />
    <style>{`@keyframes ping { 75%,100% { transform: scale(1.8); opacity: 0; } }`}</style>
  </span>
);

// === ETA CALCULATOR ===
const getETA = (status, createdAt) => {
  if (status === 'Delivered') return null;
  const placed = new Date(createdAt).getTime();
  const now    = Date.now();
  const elapsed = Math.floor((now - placed) / 60000); // minutes elapsed

  if (status === 'Processing') {
    const remaining = Math.max(5, 25 - elapsed);
    return `~${remaining} min to pick up`;
  }
  if (status === 'Out for Delivery') {
    const remaining = Math.max(2, 20 - elapsed);
    return `~${remaining} min to delivery`;
  }
  return null;
};


// === MAIN COMPONENT ===
const OrderTracking = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/get_single.php?id=${id}`, {
        headers: { }
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setLastUpdated(new Date());
      } else {
        setError('Order not found.');
      }
    } catch {
      setError('Failed to load order. Check your connection.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Real-time polling — stops when delivered or cancelled
  useEffect(() => {
    if (!order) return;
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(fetchOrder, 10000);
    return () => clearInterval(intervalRef.current);
  }, [order?.status]);

  // ── Loading State ──────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '4px solid #dcfce7', borderTopColor: '#22c55e',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: 'var(--text-muted)' }}>Loading order...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
      <XCircle size={48} color="#fca5a5" style={{ marginBottom: 12 }} />
      <p style={{ color: '#ef4444', marginBottom: 16, fontWeight: 600 }}>{error}</p>
      <Link to="/my-orders" style={{ color: '#22c55e', fontWeight: 600 }}>← Back to Orders</Link>
    </div>
  );

  const stepIndex  = getStepIndex(order.status);
  const isCancelled = order.status === 'Cancelled';
  const isDelivered = order.status === 'Delivered';
  const activeStep  = STEPS[stepIndex];
  const eta         = getETA(order.status, order.created_at);

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 16px 60px' }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .track-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 22px; margin-bottom: 16px; animation: fadeSlideIn 0.4s ease; }
      `}</style>

      {/* Top Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="back-btn">
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
      </div>

      {/* Hero status banner */}
      {!isCancelled ? (
        <div style={{
          background: `linear-gradient(135deg, ${activeStep.color}22, ${activeStep.color}08)`,
          border: `1.5px solid ${activeStep.color}44`,
          borderRadius: 20, padding: '22px 24px', marginBottom: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 54, height: 54, borderRadius: 16,
              background: activeStep.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <activeStep.icon size={26} color={activeStep.color} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-dark)' }}>
                {activeStep.label}
                {!isDelivered && <PulseDot color={activeStep.color} />}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 3 }}>{activeStep.desc}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {eta && (
              <div style={{ fontWeight: 700, fontSize: '1rem', color: activeStep.color }}>{eta}</div>
            )}
            {lastUpdated && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                <RefreshCw size={11} /> Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 20, padding: '22px 24px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <XCircle size={36} color="#ef4444" />
          <div>
            <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '1.1rem' }}>Order Cancelled</div>
            <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 4 }}>This order has been cancelled. Refund (if any) will be processed within 5–7 business days.</div>
          </div>
        </div>
      )}

      {/* Order ID + Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Order #ORD-{order.id}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '3px 0 0' }}>
            {new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/my-orders" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>My Orders</Link>
      </div>

      {/* Progress Stepper */}
      {!isCancelled && (
        <div className="track-card" style={{ paddingBottom: 28 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: 28, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            Live Tracking Progress
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress bar */}
            <div style={{ position: 'absolute', top: 23, left: '14%', right: '14%', height: 4, background: '#e5e7eb', borderRadius: 4, zIndex: 0 }}>
              <div style={{
                height: '100%', background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                width: `${Math.min(100, (stepIndex / (STEPS.length - 1)) * 100)}%`,
                borderRadius: 4, transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)'
              }} />
            </div>

            {STEPS.map((step, idx) => {
              const done   = idx <= stepIndex;
              const active = idx === stepIndex && !isDelivered;
              const S = step.icon;
              return (
                <div key={step.key} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  {/* Circle */}
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', margin: '0 auto 10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? `linear-gradient(135deg, ${step.color}, ${step.color}cc)` : '#e5e7eb',
                    color: done ? '#fff' : '#9ca3af',
                    boxShadow: active ? `0 0 0 5px ${step.color}30` : 'none',
                    transition: 'all 0.5s ease',
                  }}>
                    <S size={20} />
                  </div>
                  <div style={{ fontWeight: done ? 700 : 500, color: done ? 'var(--text-dark)' : '#9ca3af', fontSize: '0.8rem', lineHeight: 1.3 }}>
                    {step.label}
                  </div>
                  {active && (
                    <div style={{ fontSize: '0.72rem', color: step.color, fontWeight: 600, marginTop: 4 }}>
                      In progress...
                    </div>
                  )}
                  {done && !active && (
                    <div style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 600, marginTop: 4 }}>
                      ✓ Done
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delivery Agent Card — only shown when assigned */}
      {order.agent_name && !isDelivered && !isCancelled && (
        <div className="track-card" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1.5px solid #bbf7d0' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#15803d', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Delivery Partner
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '1.3rem'
              }}>
                {order.agent_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>{order.agent_name}</div>
                <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 2 }}>Delivery Partner</div>
              </div>
            </div>
            {order.agent_phone && (
              <a href={`tel:${order.agent_phone}`} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#16a34a', color: '#fff',
                padding: '10px 18px', borderRadius: 12,
                textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem',
                boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
              }}>
                <Phone size={15} /> Call
              </a>
            )}
          </div>
        </div>
      )}

      {/* Delivery success agent card */}
      {order.agent_name && isDelivered && (
        <div className="track-card" style={{ textAlign: 'center', background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
          <CheckCircle size={36} color="#22c55e" style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>Delivered by {order.agent_name}!</div>
          {order.delivery_notes && <div style={{ fontSize: '0.83rem', color: '#6b7280' }}>Note: {order.delivery_notes}</div>}
        </div>
      )}

      {/* Address + Payment Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 14, marginTop: 4 }}>
        {/* Address */}
        <div className="track-card" style={{ margin: 0 }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <MapPin size={14} color="#22c55e" /> Delivery Address
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 4px' }}>{order.street_address}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 8px' }}>{order.city} - {order.zip_code}</p>
          {order.delivery_phone && (
            <p style={{ color: 'var(--text-dark)', fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={12} color="#9ca3af" /> {order.delivery_phone}
            </p>
          )}
        </div>

        {/* Payment */}
        <div className="track-card" style={{ margin: 0 }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Payment Summary
          </h3>
          {[
            ['Method', order.payment_method],
            ['Status', order.payment_status],
            ...(order.coupon_code ? [['Coupon', `🏷️ ${order.coupon_code}`]] : []),
            ...(order.transaction_id ? [['Txn ID', order.transaction_id]] : []),
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{k}</span>
              <span style={{ color: 'var(--text-dark)', fontSize: '0.85rem', fontWeight: 500, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Total Paid</span>
            <span style={{ color: '#22c55e', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 2 }}>
              ₹{Number(order.final_total).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="track-card" style={{ marginTop: 14 }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Package size={14} color="#22c55e" /> Order Items ({order.items?.length || 0})
        </h3>
        {order.items?.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '10px 0',
            borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, background: '#f3f4f6', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.image_path ? (
                <img
                  src={item.image_path.startsWith('http') ? item.image_path : `${API_BASE}${item.image_path}`}
                  alt={item.product_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : <Package size={18} color="#9ca3af" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{item.product_name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>Qty: {item.quantity} × ₹{Number(item.unit_price).toFixed(0)}</div>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
              ₹{Number(item.unit_price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Auto-refresh notice */}
      {!isDelivered && !isCancelled && (
        <div style={{ textAlign: 'center', marginTop: 18, color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <RefreshCw size={13} style={{ animation: 'spin 3s linear infinite' }} />
          Tracking updates automatically every 10 seconds
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
