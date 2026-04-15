import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';
import '../pages/Products.css';

import API_BASE from '../config.js';

const Settings = () => {
  const [formData, setFormData] = useState({
    store_name: '',
    support_email: '',
    support_phone: '',
    currency: '₹',
    delivery_fee: '',
    free_delivery_threshold: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/settings/get.php`);
      const data = await response.json();
      if (response.ok) {
        setFormData({
          store_name: data.store_name,
          support_email: data.support_email,
          support_phone: data.support_phone,
          currency: data.currency,
          delivery_fee: data.delivery_fee,
          free_delivery_threshold: data.free_delivery_threshold
        });
      }
    } catch (e) {
      console.error("Failed to fetch settings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/settings/update.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setToast({ show: true, message: 'Settings saved successfully!', type: 'success' });
      } else {
        setToast({ show: true, message: 'Failed to save settings.', type: 'error' });
      }
    } catch (e) {
      setToast({ show: true, message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Settings</h1>
          <p className="page-subtitle">Manage global application settings and theme configurations.</p>
        </div>
      </div>

      <div className="data-card glass" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>General Information</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Store Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.store_name} 
              onChange={(e) => setFormData({...formData, store_name: e.target.value})}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Support Email</label>
              <input 
                type="email" 
                className="form-input" 
                value={formData.support_email} 
                onChange={(e) => setFormData({...formData, support_email: e.target.value})}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Support Phone</label>
              <input 
                type="tel" 
                className="form-input" 
                value={formData.support_phone} 
                onChange={(e) => setFormData({...formData, support_phone: e.target.value})}
                required
              />
            </div>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '32px 0 24px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>App Preferences</h3>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Currency Symbol</label>
              <select 
                className="form-input filter-select"
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="₹">INR (₹)</option>
                <option value="£">GBP (£)</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Standard Delivery Fee</label>
              <input 
                type="number" 
                step="0.01" 
                className="form-input" 
                value={formData.delivery_fee} 
                onChange={(e) => setFormData({...formData, delivery_fee: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Free Delivery Threshold</label>
            <input 
              type="number" 
              step="0.01" 
              className="form-input" 
              value={formData.free_delivery_threshold} 
              onChange={(e) => setFormData({...formData, free_delivery_threshold: e.target.value})}
              required
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
              Orders above this amount will get free delivery.
            </span>
          </div>

          <div className="form-actions" style={{ marginTop: '40px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ minWidth: 150, justifyContent: 'center' }}
              disabled={saving}
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
    </div>
  );
};

export default Settings;
