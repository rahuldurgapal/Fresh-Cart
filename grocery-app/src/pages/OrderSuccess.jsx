import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Automatically scroll to top
        window.scrollTo(0, 0);

        // Progress bar simulation
        const timer1 = setTimeout(() => setProgress(1), 3000); // Packing
        const timer2 = setTimeout(() => setProgress(2), 7000); // Out for Delivery
        const timer3 = setTimeout(() => setProgress(3), 11000); // Arrived

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    const steps = [
        { title: "Order Accepted", icon: "fa-clipboard-check" },
        { title: "Packing Items", icon: "fa-box-open" },
        { title: "Out for Delivery", icon: "fa-motorcycle" },
        { title: "Arriving Soon!", icon: "fa-house-chimney" }
    ];

    return (
        <div className="order-success-page">
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
                <div className="success-icon-wrapper">
                    <i className="fa-solid fa-check"></i>
                </div>
                <h1>Order Placed Successfully!</h1>
                <p>Sit tight! We are preparing your order and it will reach you shortly.</p>

                <div className="tracking-card">
                    <div className="tracking-header">
                        <h3>Live Tracking <span className="pulsing-dot"></span></h3>
                        <span className="eta-badge">ETA: {12 - progress * 3} mins</span>
                    </div>

                    <div className="tracking-stepper">
                        {steps.map((step, index) => (
                            <div key={index} className={`stepper-item ${progress >= index ? 'completed' : ''} ${progress === index ? 'active' : ''}`}>
                                <div className="step-icon">
                                    <i className={`fa-solid ${step.icon}`}></i>
                                </div>
                                <div className="step-content">
                                    <h4>{step.title}</h4>
                                    {progress === index && <p className="step-desc">Currently in progress...</p>}
                                </div>
                            </div>
                        ))}
                        <div className="progress-line-bg">
                            <div className="progress-line-fill" style={{ height: `${(progress / 3) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                <Link to="/" className="btn-primary" style={{ padding: '14px 40px', fontSize: '1.1rem', textDecoration: 'none' }}>
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccess;
