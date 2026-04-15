import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import API_BASE from '../config.js';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [regError, setRegError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRegError('');
        
        if (password !== confirmPassword) {
            setRegError("Passwords don't match!");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/auth/register.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Auto login after register
                login(data);
                navigate('/');
            } else {
                setRegError(data.message || 'Registration failed. Email might already exist.');
            }
        } catch (error) {
            console.error('Registration error', error);
            setRegError('Network error during registration. Server might be down.');
        }
    };

    return (
        <main className="auth-wrapper fade-in">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Create Account</h2>
                    <p>Join us and start shopping fresh groceries</p>
                </div>
                
                {regError && <div style={{ background: '#fdf3f2', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #f9d1cd', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {regError}
                </div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" className="form-control" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" className="form-control" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" className="form-control" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input type="password" id="confirm-password" className="form-control" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    </div>
                    
                    <div className="form-options" style={{ marginTop: '2rem' }}>
                        <label className="checkbox-wrap">
                            <input type="checkbox" required />
                            <span>I agree to the Terms & Conditions</span>
                        </label>
                    </div>
                    
                    <button type="submit" className="btn-primary btn-auth" style={{ textAlign: 'center' }}>Create Account</button>
                </form>
                
                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>
        </main>
    );
};

export default Register;
