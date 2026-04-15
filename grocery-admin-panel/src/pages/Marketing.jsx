import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

import API_BASE from '../config.js';

const Marketing = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    title: '', subtitle: '', button_text: 'Shop Now',
    button_link: '/', bg_color: '#22c55e', status: 'Active', image: ''
  });

  const fetchBanners = async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/banners/banners.php`);
      const data = await res.json();
      if (data.records) setBanners(data.records);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/banners/banners.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setToast({ show: true, message: 'Banner created!', type: 'success' });
        setIsModalOpen(false);
        fetchBanners();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/banners/banners.php?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBanners(banners.filter(b => b.id !== id));
        setToast({ show: true, message: 'Banner deleted.', type: 'success' });
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="page-container">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, show: false }))} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Marketing Banners</h1>
          <p className="page-subtitle">Manage hero slider banners shown on the consumer app homepage.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormData({ title: '', subtitle: '', button_text: 'Shop Now', button_link: '/', bg_color: '#22c55e', status: 'Active', image: '' }); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Banner
        </button>
      </div>

      {/* Banner Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {loading ? (
          <p style={{ color: '#9ca3af' }}>Loading...</p>
        ) : banners.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No banners yet. Create your first one!</p>
        ) : banners.map(banner => (
          <div key={banner.id} style={{
            borderRadius: '16px', overflow: 'hidden',
            border: '1px solid var(--border)',
            background: 'var(--card-bg)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            {/* Banner Preview */}
            <div style={{
              height: '130px', background: banner.image_path
                ? `url(${API_BASE}${banner.image_path}) center/cover`
                : `linear-gradient(135deg, ${banner.bg_color}, ${banner.bg_color}aa)`,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: '16px', color: '#fff', position: 'relative'
            }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{banner.title}</div>
              {banner.subtitle && <div style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: '4px' }}>{banner.subtitle}</div>}
              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                {banner.status === 'Active'
                  ? <span style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>Active</span>
                  : <span style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>Inactive</span>
                }
              </div>
            </div>

            {/* Banner Meta */}
            <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#6b7280' }}>
                <ExternalLink size={13} />
                <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.button_link}</span>
              </div>
              <button onClick={() => handleDelete(banner.id)} style={{ background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', padding: '6px' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Banner Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Banner">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="form-label">Title *</label>
            <input className="form-input" required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="Fresh Vegetables Daily" />
          </div>
          <div>
            <label className="form-label">Subtitle</label>
            <input className="form-input" value={formData.subtitle} onChange={e => setFormData(p => ({ ...p, subtitle: e.target.value }))} placeholder="Farm to table in 30 minutes" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Button Text</label>
              <input className="form-input" value={formData.button_text} onChange={e => setFormData(p => ({ ...p, button_text: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Button Link</label>
              <input className="form-input" value={formData.button_link} onChange={e => setFormData(p => ({ ...p, button_link: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Background Color</label>
              <input type="color" value={formData.bg_color} onChange={e => setFormData(p => ({ ...p, bg_color: e.target.value }))} style={{ width: '100%', height: '42px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg)' }} />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Banner Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Banner</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Marketing;
