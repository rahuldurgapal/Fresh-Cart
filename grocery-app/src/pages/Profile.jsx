import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useWallet } from '../context/WalletContext';
import './Profile.css';

import API_BASE from '../config.js';


const Profile = () => {
    const { user, login, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { showToast } = useToast();
    const { balance } = useWallet();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('info');
    const [realOrders, setRealOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const [addresses, setAddresses] = useState([]);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [addressData, setAddressData] = useState({
        id: null,
        street: '',
        city: '',
        zip: '',
        phone: ''
    });
    const [addressLoading, setAddressLoading] = useState(false);
    const [addressSaving, setAddressSaving] = useState(false);

    const fetchAddresses = () => {
        setAddressLoading(true);
        fetch(`${API_BASE}/api/address/get_by_user.php?user_id=${user.id}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
            .then(r => {
                if (r.status === 401) {
                    logout();
                    navigate('/login');
                    return null;
                }
                return r.json();
            })
            .then(data => {
                if (data && data.records) setAddresses(data.records);
                else setAddresses([]);
                setAddressLoading(false);
            })
            .catch(() => setAddressLoading(false));
    };

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'orders' && user?.id) {
            setOrdersLoading(true);
            fetch(`${API_BASE}/api/orders/get_by_user.php?user_id=${user.id}`)
                .then(r => r.json())
                .then(data => { setRealOrders(data.records || []); setOrdersLoading(false); })
                .catch(() => setOrdersLoading(false));
        }
        
        if (activeTab === 'address' && user?.id) {
            fetchAddresses();
        }
    }, [activeTab, user]);

    const [showMobileSidebar, setShowMobileSidebar] = useState(true);

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <h2>Please Login to view your profile</h2>
                <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/login')}>Go to Login</button>
            </div>
        );
    }

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/api/users/update_profile.php`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    id: user.id,
                    name: formData.name,
                    phone: formData.phone
                })
            });
            if (response.status === 401) {
                logout();
                navigate('/login');
                return;
            }
            const data = await response.json();
            
            if (response.ok) {
                // Update local context with new name but keep existing token
                login({ user: { ...user, name: formData.name, phone: formData.phone }, token: user.token });
                showToast('Profile updated successfully!', 'success');
            } else {
                showToast(data.message || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Update error:', error);
            showToast('Network error. Please try again.', 'error');
        }
    };

    const handleAddressSave = async (e) => {
        e.preventDefault();
        setAddressSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/address/upsert.php`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    id: addressData.id,
                    user_id: user.id,
                    street_address: addressData.street,
                    city: addressData.city,
                    zip_code: addressData.zip,
                    phone_number: addressData.phone
                })
            });

            if (res.status === 401) {
                logout();
                navigate('/login');
                return;
            }
            const data = await res.json();
            
            if (res.ok) {
                showToast(data.message || 'Address saved successfully!', 'success');
                setIsAddingAddress(false);
                setAddressData({ id: null, street: '', city: '', zip: '', phone: '' });
                fetchAddresses();
            } else {
                showToast(data.message || 'Failed to save address', 'error');
            }
        } catch(err) {
            console.error('Address update error:', err);
            showToast('Network error. Please try again.', 'error');
        } finally {
            setAddressSaving(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Delete this address?")) return;
        try {
            const res = await fetch(`${API_BASE}/api/address/delete.php`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                showToast('Address deleted', 'success');
                fetchAddresses();
            } else {
                showToast('Failed to delete address', 'error');
            }
        } catch(err) {
            showToast('Network error', 'error');
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        
        try {
            const res = await fetch(`${API_BASE}/api/orders/update_status.php`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ id: orderId, status: 'Cancelled' })
            });
            const data = await res.json();
            
            if (res.ok) {
                showToast('Order cancelled successfully.', 'success');
                // Update local state to reflect change instantly
                setRealOrders(orders => orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
            } else {
                showToast(data.message || 'Could not cancel order.', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Network error while cancelling.', 'error');
        }
    };

    return (
        <>
            <div style={{ maxWidth: '1200px', margin: '20px auto 0', padding: '0 24px' }}>
                <button onClick={() => navigate(-1)} className="back-btn">
                    <i className="fa-solid fa-arrow-left"></i> Back
                </button>
            </div>
            <div className="profile-container wrapper-details fade-in" style={{ marginTop: '10px' }}>
            <aside className={`profile-sidebar ${!showMobileSidebar ? 'd-none-mobile' : ''}`}>
                <div className="profile-user-info">
                    <div className="profile-avatar">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                </div>
                
                <nav className="profile-nav">
                    <button 
                        className={`profile-nav-btn ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('info'); setShowMobileSidebar(false); }}
                    >
                        <i className="fa-regular fa-user"></i> My Information
                    </button>
                    <button 
                        className={`profile-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('orders'); setShowMobileSidebar(false); }}
                    >
                        <i className="fa-solid fa-box"></i> Order History
                    </button>
                    <button 
                        className={`profile-nav-btn ${activeTab === 'address' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('address'); setShowMobileSidebar(false); }}
                    >
                        <i className="fa-solid fa-location-dot"></i> My Addresses
                    </button>
                    <Link to="/wallet" className="profile-nav-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <i className="fa-solid fa-wallet" style={{ color: '#16a34a' }}></i> Wallet <span style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.12)', color: '#16a34a', fontSize: '0.78rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>₹{balance.toFixed(0)}</span>
                    </Link>
                    <button 
                        className={`profile-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('settings'); setShowMobileSidebar(false); }}
                    >
                        <i className="fa-solid fa-gear"></i> Settings
                    </button>
                    <button 
                        className="profile-nav-btn"
                        onClick={() => { logout(); navigate('/'); }}
                        style={{ color: 'var(--danger)' }}
                    >
                        <i className="fa-solid fa-right-from-bracket" style={{ color: 'inherit' }}></i> Logout
                    </button>
                </nav>
            </aside>

            <main className={`profile-content ${showMobileSidebar ? 'd-none-mobile' : ''}`}>
                <button 
                    className="mobile-back-btn desktop-hidden" 
                    onClick={() => setShowMobileSidebar(true)}
                    style={{ marginBottom: '16px', background: 'none', border: 'none', fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <i className="fa-solid fa-arrow-left"></i> Back to Menu
                </button>

                {activeTab === 'info' && (
                    <section className="profile-section fade-in">
                        <h2>Personal Information</h2>
                        <form onSubmit={handleSave}>
                            <div className="profile-form-grid">
                                <div className="profile-form-group">
                                    <label>Full Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="profile-form-group">
                                    <label>Email Address</label>
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        disabled
                                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="save-btn">Save Changes</button>
                        </form>
                    </section>
                )}
                
                {activeTab === 'address' && (
                    <section className="profile-section fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Manage Delivery Addresses</h2>
                            {!isAddingAddress && (
                                <button onClick={() => { setAddressData({ id: null, street: '', city: '', zip: '', phone: '' }); setIsAddingAddress(true); }} className="btn-primary" style={{ padding: '8px 16px' }}>
                                    + Add New
                                </button>
                            )}
                        </div>
                        {addressLoading ? (
                            <p>Loading address details...</p>
                        ) : isAddingAddress ? (
                            <form onSubmit={handleAddressSave}>
                                <div className="profile-form-grid">
                                    <div className="profile-form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Street Address / House No.</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={addressData.street}
                                            onChange={e => setAddressData({...addressData, street: e.target.value})}
                                            placeholder="e.g. 123, Green Apartments, Main St"
                                        />
                                    </div>
                                    <div className="profile-form-group">
                                        <label>City</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={addressData.city}
                                            onChange={e => setAddressData({...addressData, city: e.target.value})}
                                            placeholder="Gurugram"
                                        />
                                    </div>
                                    <div className="profile-form-group">
                                        <label>Pincode / Zip Code</label>
                                        <input 
                                            type="text" 
                                            required
                                            pattern="[0-9]{5,6}"
                                            value={addressData.zip}
                                            onChange={e => setAddressData({...addressData, zip: e.target.value})}
                                            placeholder="122001"
                                        />
                                    </div>
                                    <div className="profile-form-group">
                                        <label>Delivery Phone Number</label>
                                        <input 
                                            type="tel" 
                                            required
                                            value={addressData.phone}
                                            onChange={e => setAddressData({...addressData, phone: e.target.value})}
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" className="save-btn" disabled={addressSaving}>
                                        {addressSaving ? 'Saving...' : 'Save Address Details'}
                                    </button>
                                    <button type="button" onClick={() => setIsAddingAddress(false)} className="save-btn" style={{ background: '#eee', color: '#333' }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="addresses-list">
                                {addresses.length > 0 ? addresses.map(addr => (
                                    <div key={addr.id} style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ fontWeight: 600, marginBottom: '6px' }}>{addr.street_address}</p>
                                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{addr.city}, {addr.zip_code}</p>
                                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: '6px' }}>Phone: {addr.phone_number}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <button onClick={() => {
                                                setAddressData({ id: addr.id, street: addr.street_address, city: addr.city, zip: addr.zip_code, phone: addr.phone_number });
                                                setIsAddingAddress(true);
                                            }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                                            <button onClick={() => handleDeleteAddress(addr.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '30px', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                                        <p style={{ color: 'var(--text-muted)' }}>No addresses found. Add one to speed up checkout.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'orders' && (
                    <section className="profile-section fade-in">
                        <h2>Order History</h2>
                        {ordersLoading ? (
                            <p style={{ color: 'var(--text-muted)' }}>Loading orders...</p>
                        ) : realOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📦</div>
                                <p>No orders yet. <Link to="/" style={{ color: 'var(--primary)' }}>Start shopping!</Link></p>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {realOrders.map(order => (
                                    <div key={order.id} className="order-card">
                                        <div className="order-header">
                                            <div>
                                                <div className="order-id">Order #ORD-{order.id}</div>
                                                <div className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                <div className={`order-status ${order.status === 'Delivered' ? 'status-delivered' : order.status === 'Cancelled' ? 'status-cancelled' : 'status-processing'}`}>
                                                    {order.status}
                                                </div>
                                            </div>
                                            <div className="order-amount">₹{Number(order.final_total).toFixed(2)}</div>
                                        </div>
                                        <div className="order-items">{order.item_names}</div>
                                        <div className="order-actions">
                                            {(order.status === 'Processing' || order.status === 'Pending') && (
                                                <button onClick={() => handleCancelOrder(order.id)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                                    Cancel Order
                                                </button>
                                            )}
                                            <Link to={`/order-tracking/${order.id}`} className="btn-rebuy" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <i className="fa-solid fa-truck"></i> Track Order
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'settings' && (
                    <section className="profile-section fade-in">
                        <h2>Preferences & Settings</h2>
                        <div className="settings-list">
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Dark Mode</h4>
                                    <p>Switch between light and dark theme</p>
                                </div>
                                <button 
                                    className={`toggle-btn ${isDarkMode ? 'active' : ''}`}
                                    onClick={toggleTheme}
                                >
                                    <div className="toggle-circle"></div>
                                </button>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Order Notifications</h4>
                                    <p>Receive order updates via Email/SMS</p>
                                </div>
                                <button className="toggle-btn active">
                                    <div className="toggle-circle"></div>
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
        </>
    );
};

export default Profile;
