import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config.js';
import { Bike, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, agent } = useAuth();
    const navigate = useNavigate();

    if (agent) { navigate('/dashboard'); return null; }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/delivery/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            const data = await res.json();
            if (res.ok) {
                login(data.agent, data.token);
                navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch {
            setError('Network error. Please check your connection.');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 40%, #052e16 100%)',
            padding: '20px'
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <Bike size={36} color="#fff" />
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 4px' }}>
                        FreshCart Delivery
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                        Delivery Agent Portal
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: '#fff', borderRadius: '20px', padding: '32px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px', color: '#111827' }}>
                        Sign In
                    </h2>

                    {error && (
                        <div style={{
                            display: 'flex', gap: '10px', alignItems: 'center',
                            background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: '10px', padding: '12px 16px', marginBottom: '20px'
                        }}>
                            <AlertCircle size={18} color="#ef4444" />
                            <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label>Email or Mobile Number</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                <input
                                    type="text" required
                                    value={identifier} onChange={e => setIdentifier(e.target.value)}
                                    placeholder="agent@freshcart.com or 9876543210"
                                    style={{ paddingLeft: '44px' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                <input
                                    type="password" required
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    style={{ paddingLeft: '44px' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
                            <button 
                                type="button" 
                                onClick={() => navigate('/forgot-password')}
                                style={{ 
                                    background: 'none', border: 'none', color: '#16a34a', 
                                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: '0' 
                                }}
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {loading ? <><span className="spinner"></span>Signing In...</> : 'Sign In'}
                        </button>
                    </form>
                </div>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '20px' }}>
                    FreshCart Delivery Partner App v1.0
                </p>
            </div>
        </div>
    );
};

export default Login;
