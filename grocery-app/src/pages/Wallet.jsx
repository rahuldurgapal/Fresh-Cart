import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';

const Wallet = () => {
    const { balance, addCashback } = useWallet();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [addAmount, setAddAmount] = useState('');
    const [success, setSuccess] = useState('');

    const quickAmounts = [100, 200, 500, 1000];

    const handleAdd = (amt) => {
        const amount = parseFloat(amt);
        if (!amount || amount <= 0) return;
        addCashback(amount);
        setSuccess(`₹${amount} added to your wallet!`);
        setAddAmount('');
        setTimeout(() => setSuccess(''), 3000);
    };

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👛</div>
                <h2 style={{ color: 'var(--text-dark)', marginBottom: '12px' }}>Please login to access your wallet</h2>
                <Link to="/login" style={{ padding: '10px 28px', background: 'var(--primary)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>
                    Login
                </Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px', minHeight: '70vh' }}>
            <button onClick={() => navigate(-1)} className="back-btn">
                <i className="fa-solid fa-arrow-left"></i> Back
            </button>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                My Wallet
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>Manage your FreshCart credits and cashback</p>

            {/* Balance Card */}
            <div style={{
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                borderRadius: '20px', padding: '32px', marginBottom: '24px',
                color: '#fff', textAlign: 'center',
                boxShadow: '0 8px 32px rgba(34,197,94,0.3)'
            }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Available Balance
                </div>
                <div style={{ fontSize: '3.2rem', fontWeight: 800, marginBottom: '4px' }}>
                    ₹{balance.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    FreshCart Credits · {user.name}
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div style={{
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
                    color: '#16a34a', fontWeight: 500, textAlign: 'center'
                }}>
                    ✅ {success}
                </div>
            )}

            {/* Add Money */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '16px' }}>
                    💳 Add Money to Wallet
                </h3>
                {/* Quick Amounts */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    {quickAmounts.map(amt => (
                        <button
                            key={amt}
                            onClick={() => handleAdd(amt)}
                            style={{
                                padding: '8px 18px', borderRadius: '10px', border: '1px solid var(--primary)',
                                color: 'var(--primary)', background: 'transparent', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background='var(--primary)'; e.currentTarget.style.color='#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--primary)'; }}
                        >
                            +₹{amt}
                        </button>
                    ))}
                </div>
                {/* Custom Amount */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="number"
                        placeholder="Enter custom amount"
                        value={addAmount}
                        onChange={e => setAddAmount(e.target.value)}
                        min="1"
                        style={{
                            flex: 1, padding: '10px 14px', borderRadius: '10px',
                            border: '1px solid var(--border)', background: 'var(--bg-color)',
                            color: 'var(--text-dark)', fontSize: '0.95rem', outline: 'none'
                        }}
                    />
                    <button
                        onClick={() => handleAdd(addAmount)}
                        style={{
                            padding: '10px 20px', borderRadius: '10px', border: 'none',
                            background: 'var(--primary)', color: '#fff', fontWeight: 600,
                            cursor: 'pointer', fontSize: '0.9rem'
                        }}
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* How it Works */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '14px' }}>
                    🎁 How FreshCart Wallet Works
                </h3>
                {[
                    { icon: '💰', text: 'Get ₹10 welcome bonus on first signup' },
                    { icon: '🔄', text: 'Earn 2% cashback on every order' },
                    { icon: '🛒', text: 'Use wallet balance during checkout' },
                    { icon: '🏷️', text: 'Stack wallet + coupon discounts together' },
                ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wallet;
