import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config.js';
import { Bike, Lock, Phone, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    // UI State: 1 = Enter Phone, 2 = Enter OTP & New Password
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (phone.length < 10) {
            setError('Please enter a valid phone number.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/delivery/send_reset_otp.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message);
                setStep(2);
            } else {
                setError(data.message || 'Failed to send OTP.');
            }
        } catch {
            setError('Network error. Please check your connection.');
        }
        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!otp) {
            setError('Please enter the OTP.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/delivery/reset_password.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp, new_password: newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message);
                setTimeout(() => navigate('/'), 2500);
            } else {
                setError(data.message || 'Failed to reset password.');
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
                        Reset Password
                    </h1>
                </div>

                <div style={{
                    background: '#fff', borderRadius: '20px', padding: '32px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px', color: '#111827', textAlign: 'center' }}>
                        {step === 1 ? "Enter phone to receive OTP" : "Set your new password"}
                    </h2>

                    {error && (
                        <div style={{
                            display: 'flex', gap: '10px', alignItems: 'center',
                            background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: '10px', padding: '12px 16px', marginBottom: '20px'
                        }}>
                            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                            <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div style={{
                            display: 'flex', gap: '10px', alignItems: 'center',
                            background: '#f0fdf4', border: '1px solid #bbf7d0',
                            borderRadius: '10px', padding: '12px 16px', marginBottom: '20px'
                        }}>
                            <CheckCircle size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                            <span style={{ color: '#15803d', fontSize: '0.9rem' }}>{success}</span>
                        </div>
                    )}

                    {step === 1 && !success?.includes("Password reset successfully") && (
                        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '4px', display: 'block' }}>Registered Mobile Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                    <input
                                        type="tel" required
                                        value={phone} onChange={e => setPhone(e.target.value)}
                                        placeholder="9876543210"
                                        style={{ paddingLeft: '44px', width: '100%', padding: '10px 10px 10px 44px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                {loading ? <><span className="spinner" style={{width:'16px', height:'16px', borderWidth:'2px'}}></span>Sending...</> : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {step === 2 && !success?.includes("Password reset successfully") && (
                        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '4px', display: 'block' }}>Mobile Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                    <input
                                        type="tel" disabled
                                        value={phone}
                                        style={{ paddingLeft: '44px', width: '100%', padding: '10px 10px 10px 44px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f3f4f6', color: '#6b7280' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '4px', display: 'block' }}>Enter OTP</label>
                                <div style={{ position: 'relative' }}>
                                    <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                    <input
                                        type="text" required maxLength="6"
                                        value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="6-digit code"
                                        style={{ paddingLeft: '44px', width: '100%', padding: '10px 10px 10px 44px', borderRadius: '8px', border: '1px solid #d1d5db', letterSpacing: '2px', fontWeight: 600 }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '4px', display: 'block' }}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                    <input
                                        type="password" required
                                        value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                        placeholder="At least 6 characters"
                                        style={{ paddingLeft: '44px', width: '100%', padding: '10px 10px 10px 44px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '4px', display: 'block' }}>Confirm New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                                    <input
                                        type="password" required
                                        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Retype password"
                                        style={{ paddingLeft: '44px', width: '100%', padding: '10px 10px 10px 44px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                {loading ? <><span className="spinner" style={{width:'16px', height:'16px', borderWidth:'2px'}}></span>Resetting...</> : 'Verify & Reset Password'}
                            </button>
                        </form>
                    )}
                    
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button 
                            type="button" 
                            onClick={() => {
                                if (step === 2 && !success?.includes("Password reset successfully")) {
                                    setStep(1);
                                    setSuccess('');
                                    setError('');
                                } else {
                                    navigate('/');
                                }
                            }}
                            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.9rem', cursor: 'pointer' }}
                        >
                            {step === 2 && !success?.includes("Password reset successfully") ? "Back" : "Back to Login"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
