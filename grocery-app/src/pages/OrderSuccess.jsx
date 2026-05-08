import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const orderId   = location.state?.orderId;
    const [countdown, setCountdown] = useState(4);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Countdown timer
        const tick = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(tick);
                    // Redirect to real tracking page if orderId available, else My Orders
                    if (orderId) {
                        navigate(`/order-tracking/${orderId}`, { replace: true });
                    } else {
                        navigate('/my-orders', { replace: true });
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(tick);
    }, [orderId, navigate]);

    return (
        <div className="order-success-page">
            {/* Confetti */}
            <div className="confetti-container">
                {Array.from({ length: 50 }).map((_, i) => (
                    <div key={i} className="confetti" style={{
                        left: `${Math.random() * 100}vw`,
                        animationDelay: `${Math.random() * 2}s`,
                        backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`
                    }}></div>
                ))}
            </div>

            <div className="success-content fade-in">
                {/* Success Icon */}
                <div className="success-icon-wrapper">
                    <i className="fa-solid fa-check"></i>
                </div>

                <h1>Order Placed Successfully!</h1>
                <p>Sit tight! We are preparing your order and it will reach you shortly.</p>

                {/* Redirect info */}
                <div style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '16px',
                    padding: '20px 28px',
                    margin: '24px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 8px',
                            fontSize: '1.5rem', fontWeight: 800,
                            color: '#fff', border: '3px solid rgba(255,255,255,0.5)'
                        }}>
                            {countdown}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: 500 }}>
                            Redirecting to <strong>Live Tracking</strong> in {countdown}s...
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {orderId && (
                        <Link
                            to={`/order-tracking/${orderId}`}
                            style={{
                                padding: '14px 28px',
                                background: '#fff',
                                color: '#16a34a',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontWeight: 700,
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }}
                        >
                            🚴 Track My Order
                        </Link>
                    )}
                    <Link
                        to="/"
                        style={{
                            padding: '14px 28px',
                            background: 'rgba(255,255,255,0.2)',
                            color: '#fff',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '1rem',
                            border: '1px solid rgba(255,255,255,0.4)'
                        }}
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
