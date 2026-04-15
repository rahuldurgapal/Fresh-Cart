import React, { useState, useEffect } from 'react';
import { Star, Trash2, Package } from 'lucide-react';

import API_BASE from '../config.js';

const Reviews = () => {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all'); // all | 1..5

  const fetchReviews = async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/reviews/get_all.php`);
      const data = await res.json();
      if (data.records) setReviews(data.records);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/reviews/delete.php?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id));
      }
    } catch (e) { console.error(e); }
  };

  const renderStars = (rating) => (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={14} fill={s <= rating ? '#f59e0b' : 'none'} color={s <= rating ? '#f59e0b' : '#d1d5db'} />
      ))}
    </div>
  );

  const filtered = filter === 'all' ? reviews : reviews.filter(r => String(r.rating) === filter);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Reviews</h1>
          <p className="page-subtitle">Moderate and manage product reviews from customers.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#9ca3af' }}>
          <span>Total: <strong style={{ color: 'var(--text-dark)' }}>{reviews.length}</strong></span>
        </div>
      </div>

      <div className="data-card glass">
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', padding: '16px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {['all', '5', '4', '3', '2', '1'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 500,
                background: filter === f ? '#22c55e' : 'var(--bg)',
                color: filter === f ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              {f === 'all' ? 'All' : `${f} ⭐`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>Loading reviews...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>No reviews found.</div>
        ) : (
          <div style={{ padding: '4px 0' }}>
            {filtered.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '16px 20px', borderBottom: '1px solid var(--border)'
              }}>
                {/* Avatar */}
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #bbf7d0, #d1fae5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: '#16a34a', fontSize: '0.9rem'
                }}>
                  {r.user_name?.charAt(0)?.toUpperCase()}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{r.user_name}</span>
                    {renderStars(r.rating)}
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Package size={12} color="#9ca3af" />
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{r.product_name || `Product #${r.product_id}`}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, lineHeight: '1.5' }}>
                    {r.comment || <em style={{ color: '#d1d5db' }}>No comment.</em>}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(r.id)}
                  title="Delete Review"
                  style={{
                    padding: '7px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: 'rgba(239,68,68,0.06)', color: '#ef4444', flexShrink: 0,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.06)'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
