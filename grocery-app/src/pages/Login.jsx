import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import API_BASE from '../config.js';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpStep, setOtpStep] = useState(1); // 1: Entry, 2: Verification
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendOtp = async (e) => {
        if (e) e.preventDefault();
        if (!phone || phone.length < 10) {
            setLoginError("Please enter a valid phone number.");
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/send_login_otp.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (res.ok) {
                setOtpStep(2);
                setLoginError('');
                
                // If the backend is in Simulated Demo Mode, alert and auto-fill the OTP!
                if (data.demo_otp) {
                    alert("DEMO MODE: Your simulated OTP is " + data.demo_otp);
                    setOtp(data.demo_otp);
                }
            } else {
                setLoginError(data.message);
            }
        } catch (e) {
            setLoginError("Failed to send OTP.");
        }
        setIsLoading(false);
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/login_with_otp.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            });
            const data = await res.json();
            if (res.ok) {
                login(data);
                navigate('/');
            } else {
                setLoginError(data.message);
            }
        } catch (e) {
            setLoginError("OTP Verification failed.");
        }
        setIsLoading(false);
    };

    return (
        <main className="auth-wrapper fade-in" style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="auth-card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
                <div className="auth-header">
                    <h2>Welcome to Grocery</h2>
                    <p>Enter your phone number to continue</p>
                </div>
                
                {loginError && <div style={{ background: '#fdf3f2', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #f9d1cd', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {loginError}
                </div>}
                
                <div style={{ marginTop: '20px' }}>
                    {otpStep === 1 ? (
                        <form onSubmit={sendOtp} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input type="tel" id="phone" className="form-control" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} required />
                                <small style={{ color: '#666', fontSize: '0.75rem', marginTop: '5px', display: 'block' }}>
                                     * You will receive a <strong>Voice Call</strong> to hear your OTP.
                                </small>
                            </div>
                            <button type="submit" disabled={isLoading} className="btn-primary btn-auth" style={{ marginTop: '15px', textAlign: 'center', width: '100%' }}>
                                {isLoading ? 'Sending OTP...' : 'Get Login OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="form-group">
                                <label>Enter OTP</label>
                                <input type="text" className="form-control" placeholder="6 Digit OTP" value={otp} onChange={e => setOtp(e.target.value)} required />
                                <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '8px', cursor: 'pointer', textAlign: 'right' }} onClick={() => setOtpStep(1)}>Change Number</p>
                            </div>
                            <button type="submit" disabled={isLoading} className="btn-primary btn-auth" style={{ marginTop: '15px', textAlign: 'center', width: '100%' }}>
                                {isLoading ? 'Verifying...' : 'Verify & Login'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="auth-footer" style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
                    <p>By continuing, you agree to our Terms of Service & Privacy Policy.</p>
                </div>
            </div>
        </main>
    );
};

export default Login;
