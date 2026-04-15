import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import API_BASE from '../config.js';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const response = await fetch(`${API_BASE}/api/auth/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Pass the whole data object which has { token, user }
                login(data);
                navigate('/');
            } else {
                setLoginError(data.message || 'Login failed. Invalid credentials.');
            }
        } catch (error) {
            console.error('Login error', error);
            setLoginError('Network error during login');
        }
    };

    return (
        <main className="auth-wrapper fade-in">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue your grocery shopping</p>
                </div>
                
                {loginError && <div style={{ background: '#fdf3f2', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #f9d1cd', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {loginError}
                </div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" className="form-control" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" className="form-control" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    
                    <div className="form-options">
                        <label className="checkbox-wrap">
                            <input type="checkbox" defaultChecked />
                            <span>Remember me</span>
                        </label>
                        <a href="#!" className="forgot-link">Forgot Password?</a>
                    </div>
                    
                    <button type="submit" className="btn-primary btn-auth" style={{ textAlign: 'center' }}>Sign In</button>
                </form>
                
                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Create an Account</Link></p>
                </div>
            </div>
        </main>
    );
};

export default Login;
