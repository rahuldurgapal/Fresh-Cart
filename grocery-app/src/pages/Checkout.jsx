import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

import API_BASE from '../config.js';

const Checkout = () => {
    const { cart, updateQuantity, clearCart } = useCart();
    const { user, logout } = useAuth();
    const { balance, useBalance } = useWallet();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const [currentStep, setCurrentStep] = useState(1);
    
    // Form States
    const [contactData, setContactData] = useState({
        name: user?.name || '',
        phone: ''
    });

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

    const [addressData, setAddressData] = useState({
        type: 'Home',
        houseNo: '',
        area: '',
        city: '',
        zip: '',
        landmark: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('');

    useEffect(() => {
        if (user) {
            fetch(`${API_BASE}/api/address/get_by_user.php?user_id=${user.id}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(r => r.json())
            .then(data => {
                if (data && data.records && data.records.length > 0) {
                    setSavedAddresses(data.records);
                    setSelectedAddressId(data.records[0].id);
                    if (!contactData.phone && data.records[0].phone_number) {
                        setContactData(prev => ({ ...prev, phone: data.records[0].phone_number }));
                    }
                } else {
                    setIsAddingNewAddress(true);
                }
            })
            .catch(console.error);
        }
    }, [user]);

    useEffect(() => {
        if (selectedAddressId && !isAddingNewAddress) {
            const addr = savedAddresses.find(a => a.id === selectedAddressId);
            if (addr && addr.phone_number && !contactData.phone) {
                setContactData(prev => ({ ...prev, phone: addr.phone_number }));
            }
        }
    }, [selectedAddressId, isAddingNewAddress, savedAddresses]);

    // Promo & Wallet States
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [useWalletBalance, setUseWalletBalance] = useState(false);
    const [promoError, setPromoError] = useState('');

    const itemTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const handlingFee = 4;
    const deliveryFee = itemTotal >= 500 ? 0 : 30;

    // Calculate applied discounts
    let discountAmount = 0;
    if (appliedPromo) {
        if (appliedPromo.type === 'Flat') discountAmount = appliedPromo.value;
        if (appliedPromo.type === 'Percent') discountAmount = itemTotal * (appliedPromo.value / 100);
    }
    
    let subTotalAfterDiscount = (itemTotal + handlingFee + deliveryFee) - discountAmount;
    if (subTotalAfterDiscount < 0) subTotalAfterDiscount = 0;

    let walletDeduction = 0;
    if (useWalletBalance && balance > 0) {
        walletDeduction = Math.min(balance, subTotalAfterDiscount);
    }

    const finalTotal = subTotalAfterDiscount - walletDeduction;

    const handleApplyPromo = async () => {
        setPromoError('');
        const code = promoCodeInput.trim().toUpperCase();
        
        try {
            const response = await fetch(`${API_BASE}/api/coupons/validate.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, cart_total: itemTotal })
            });
            const data = await response.json();
            
            if (response.ok) {
                setAppliedPromo({ 
                   code: data.coupon.code, 
                   type: data.coupon.discount_type === 'Flat' ? 'Flat' : 'Percent', 
                   value: data.coupon.discount_value 
                });
            } else {
                setPromoError(data.message || 'Invalid or expired promo code.');
            }
        } catch(e) {
            setPromoError("Network error checking promo code");
        }
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        setCurrentStep(prev => prev + 1);
    };

    const handlePlaceOrder = async () => {
        if (!user) return navigate('/login');
        if (cart.length === 0) return;
        
        let finalAddressId = null;
        let finalAddressData = null;

        if (isAddingNewAddress) {
            finalAddressData = {
                houseNo: addressData.houseNo,
                area: addressData.area,
                city: addressData.city,
                zip: addressData.zip,
                type: addressData.type
            };
        } else {
            finalAddressId = selectedAddressId;
        }

        const payload = {
            user_id: user.id,
            cart: cart.map(c => ({ id: c.id, price: c.price, quantity: c.quantity, unit: c.unit })),
            address: finalAddressData,
            address_id: finalAddressId,
            phone: contactData.phone,
            coupon: appliedPromo ? appliedPromo.code : null,
            payment_method: paymentMethod,
            final_total: finalTotal
        };

        try {
            const response = await fetch(`${API_BASE}/api/orders/place_order.php`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 401) {
                logout();
                navigate('/login');
                return;
            }

            if (response.ok) {
                 if (useWalletBalance && walletDeduction > 0) {
                     useBalance(walletDeduction);
                 }
                 clearCart();
                 navigate('/order-success');
            } else {
                 const data = await response.json();
                 alert("Failed to place order: " + data.message);
            }
        } catch (e) {
            console.error(e);
            alert("Network Error during checkout");
        }
    };



    return (
        <div className="checkout-page-wrapper" style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
            <button onClick={() => navigate(-1)} className="back-btn">
                <i className="fa-solid fa-arrow-left"></i> Back
            </button>
            <div className="checkout-container" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
            {/* Stepper Flow */}
            <div className="checkout-stepper fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Step 1: Contact */}
                <div className="step-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: currentStep === 1 ? '2px solid var(--primary)' : '1px solid #eee', opacity: currentStep < 1 ? 0.5 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: currentStep === 1 ? '20px' : '0' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: currentStep >= 1 ? '#222' : '#999' }}>
                            <span style={{ background: currentStep >= 1 ? 'var(--primary)' : '#eee', color: currentStep >= 1 ? '#fff' : '#999', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</span>
                            Contact Details
                        </h3>
                        {currentStep > 1 && <button onClick={() => setCurrentStep(1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Change</button>}
                    </div>

                    {currentStep === 1 && (
                        <form onSubmit={handleNextStep}>
                            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name</label>
                                <input type="text" required value={contactData.name} onChange={e => setContactData({...contactData, name: e.target.value})} className="form-control" placeholder="John Doe" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Phone Number</label>
                                <input type="tel" required minLength={10} value={contactData.phone} onChange={e => setContactData({...contactData, phone: e.target.value})} className="form-control" placeholder="+91 9876543210" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px' }}>Proceed to Address</button>
                        </form>
                    )}
                    {currentStep > 1 && (
                        <div style={{ paddingLeft: '40px', fontSize: '0.95rem', color: '#555' }}>
                            {contactData.name} • {contactData.phone}
                        </div>
                    )}
                </div>

                {/* Step 2: Address */}
                <div className="step-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: currentStep === 2 ? '2px solid var(--primary)' : '1px solid #eee', opacity: currentStep < 2 ? 0.5 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: currentStep === 2 ? '20px' : '0' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: currentStep >= 2 ? '#222' : '#999' }}>
                            <span style={{ background: currentStep >= 2 ? 'var(--primary)' : '#eee', color: currentStep >= 2 ? '#fff' : '#999', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</span>
                            Delivery Address
                        </h3>
                        {currentStep > 2 && <button onClick={() => setCurrentStep(2)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Change</button>}
                    </div>

                    {currentStep === 2 && (
                        <form onSubmit={handleNextStep}>
                            {!isAddingNewAddress && savedAddresses.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ fontWeight: 600, marginBottom: '10px' }}>Saved Addresses</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {savedAddresses.map(addr => (
                                            <label key={addr.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '12px', border: selectedAddressId === addr.id ? '2px solid var(--primary)' : '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', background: selectedAddressId === addr.id ? 'var(--bg-color)' : '#fff' }}>
                                                <input type="radio" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} style={{ accentColor: 'var(--primary)', marginTop: '4px', marginRight: '10px' }} />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{addr.street_address}</div>
                                                    <div style={{ fontSize: '0.9rem', color: '#555' }}>{addr.city}, {addr.zip_code}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => setIsAddingNewAddress(true)} style={{ marginTop: '16px', background: 'none', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, width: '100%' }}>
                                        + Add New Address
                                    </button>
                                </div>
                            )}

                            {(isAddingNewAddress || savedAddresses.length === 0) && (
                                <div>
                                    {savedAddresses.length > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                            <p style={{ fontWeight: 600 }}>Add New Address</p>
                                            <button type="button" onClick={() => setIsAddingNewAddress(false)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>Cancel</button>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '1.5rem' }}>
                                        <label style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', border: addressData.type === 'Home' ? '2px solid var(--primary)' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                                            <input type="radio" checked={addressData.type === 'Home'} onChange={() => setAddressData({...addressData, type: 'Home'})} style={{ accentColor: 'var(--primary)' }} /> Home
                                        </label>
                                        <label style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', border: addressData.type === 'Work' ? '2px solid var(--primary)' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                                            <input type="radio" checked={addressData.type === 'Work'} onChange={() => setAddressData({...addressData, type: 'Work'})} style={{ accentColor: 'var(--primary)' }} /> Work
                                        </label>
                                        <label style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', border: addressData.type === 'Other' ? '2px solid var(--primary)' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                                            <input type="radio" checked={addressData.type === 'Other'} onChange={() => setAddressData({...addressData, type: 'Other'})} style={{ accentColor: 'var(--primary)' }} /> Other
                                        </label>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>House / Flat No.</label>
                                        <input type="text" required value={addressData.houseNo} onChange={e => setAddressData({...addressData, houseNo: e.target.value})} className="form-control" placeholder="Block C, Flat 102" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Apartment / Area</label>
                                        <input type="text" required value={addressData.area} onChange={e => setAddressData({...addressData, area: e.target.value})} className="form-control" placeholder="South City I, Gurugram" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '1.5rem' }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>City</label>
                                            <input type="text" required value={addressData.city} onChange={e => setAddressData({...addressData, city: e.target.value})} className="form-control" placeholder="Gurugram" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Pincode</label>
                                            <input type="text" required pattern="[0-9]{5,6}" value={addressData.zip} onChange={e => setAddressData({...addressData, zip: e.target.value})} className="form-control" placeholder="122018" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px' }}>Proceed to Payment</button>
                        </form>
                    )}
                    {currentStep > 2 && (
                        <div style={{ paddingLeft: '40px', fontSize: '0.95rem', color: '#555' }}>
                            {isAddingNewAddress ? (
                                <>
                                    <span style={{ background: '#eee', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', marginRight: '8px', fontWeight: 600 }}>{addressData.type}</span>
                                    {addressData.houseNo}, {addressData.area}, {addressData.city} - {addressData.zip}
                                </>
                            ) : (
                                <>
                                    {savedAddresses.find(a => a.id === selectedAddressId)?.street_address}, {savedAddresses.find(a => a.id === selectedAddressId)?.city} - {savedAddresses.find(a => a.id === selectedAddressId)?.zip_code}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Step 3: Payment */}
                <div className="step-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: currentStep === 3 ? '2px solid var(--primary)' : '1px solid #eee', opacity: currentStep < 3 ? 0.5 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: currentStep === 3 ? '20px' : '0' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: currentStep === 3 ? '#222' : '#999' }}>
                            <span style={{ background: currentStep === 3 ? 'var(--primary)' : '#eee', color: currentStep === 3 ? '#fff' : '#999', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>3</span>
                            Payment Method
                        </h3>
                    </div>

                    {currentStep === 3 && (
                        <div>
                            <div className="payment-options" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: paymentMethod === 'upi' ? '2px solid var(--primary)' : '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', background: paymentMethod === 'upi' ? '#f4fbf6' : '#fff' }}>
                                    <input type="radio" name="payment" onChange={() => setPaymentMethod('upi')} checked={paymentMethod === 'upi'} style={{ accentColor: 'var(--primary)' }} />
                                    <div>
                                        <div style={{ fontWeight: 600 }}>UPI Any App</div>
                                        <div style={{ fontSize: '0.8rem', color: '#777' }}>GPay, PhonePe, Paytm</div>
                                    </div>
                                    {paymentMethod === 'upi' && <div style={{ marginLeft: 'auto', background: '#fff', padding: '4px', border: '1px solid #eee', borderRadius: '4px' }}><i className="fa-solid fa-qrcode" style={{ fontSize: '1.5rem', color: '#555' }}></i></div>}
                                </label>
                                
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: paymentMethod === 'card' ? '2px solid var(--primary)' : '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', background: paymentMethod === 'card' ? '#f4fbf6' : '#fff' }}>
                                    <input type="radio" name="payment" onChange={() => setPaymentMethod('card')} checked={paymentMethod === 'card'} style={{ accentColor: 'var(--primary)' }} />
                                    <div>
                                        <div style={{ fontWeight: 600 }}>Credit / Debit Card</div>
                                        <div style={{ fontSize: '0.8rem', color: '#777' }}>Visa, MasterCard, RuPay</div>
                                    </div>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: paymentMethod === 'cod' ? '2px solid var(--primary)' : '1px solid #ddd', borderRadius: '12px', cursor: 'pointer', background: paymentMethod === 'cod' ? '#f4fbf6' : '#fff' }}>
                                    <input type="radio" name="payment" onChange={() => setPaymentMethod('cod')} checked={paymentMethod === 'cod'} style={{ accentColor: 'var(--primary)' }} />
                                    <div>
                                        <div style={{ fontWeight: 600 }}>Cash on Delivery</div>
                                        <div style={{ fontSize: '0.8rem', color: '#777' }}>Pay at your doorstep</div>
                                    </div>
                                </label>
                            </div>
                            <button 
                                onClick={handlePlaceOrder}
                                disabled={cart.length === 0 || !paymentMethod}
                                style={{ width: '100%', background: '#0c831f', color: 'white', padding: '15px', borderRadius: '12px', border: 'none', fontSize: '1.1rem', fontWeight: 700, cursor: (cart.length > 0 && paymentMethod) ? 'pointer' : 'not-allowed', opacity: (cart.length > 0 && paymentMethod) ? 1 : 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                            >
                                Pay ₹{finalTotal.toFixed(2)} & Place Order <i className="fa-solid fa-lock"></i>
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* Cart Summary Section */}
            <div className="checkout-summary fade-in" style={{ background: '#fff', padding: '24px', border: '1px solid #eee', borderRadius: '16px', height: 'fit-content', position: 'sticky', top: '100px' }}>
                <h3 style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>Order Summary</h3>
                <div style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto', paddingRight: '5px' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0' }}>
                            <i className="fa-solid fa-basket-shopping" style={{ fontSize: '3rem', color: '#e0e0e0', marginBottom: '15px' }}></i>
                            <p style={{ color: '#7f8c8d' }}>Your cart is empty.</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', margin: '15px 0', paddingBottom: '15px', borderBottom: '1px dashed #f0f0f0' }}>
                                <div style={{ background: '#f8f8f8', padding: '5px', borderRadius: '8px' }}>
                                    <img src={item.image} alt={item.title} style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                                </div>
                                <div style={{ flex: 1, marginLeft: '12px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3 }}>{item.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>{item.unit}</div>
                                    <div style={{ fontWeight: 700, marginTop: '4px', color: '#222' }}>₹{item.price}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f4fbf6', border: '1px solid #c3ebce', borderRadius: '6px', padding: '4px 8px' }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }} onClick={() => updateQuantity(item.id, -1)}>-</button>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.quantity}</span>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }} onClick={() => updateQuantity(item.id, 1)}>+</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {cart.length > 0 && (
                    <div style={{ marginTop: '20px', background: '#fcfcfc', borderRadius: '12px', padding: '15px', border: '1px solid #f0f0f0' }}>
                        
                        {/* Promo Code Section */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                            <input 
                                type="text" 
                                placeholder="Have a promo code?" 
                                value={promoCodeInput}
                                onChange={(e) => setPromoCodeInput(e.target.value)}
                                style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', textTransform: 'uppercase' }}
                                disabled={!!appliedPromo}
                            />
                            {appliedPromo ? (
                                <button onClick={() => setAppliedPromo(null)} style={{ padding: '0 15px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
                            ) : (
                                <button onClick={handleApplyPromo} style={{ padding: '0 15px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Apply</button>
                            )}
                        </div>
                        {promoError && <div style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '-10px', marginBottom: '15px' }}>{promoError}</div>}
                        {appliedPromo && <div style={{ color: '#2ecc71', fontSize: '0.85rem', marginTop: '-10px', marginBottom: '15px' }}>Promo '{appliedPromo.code}' applied!</div>}

                        {/* Wallet Section */}
                        {balance > 0 && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', marginBottom: '15px', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={useWalletBalance} 
                                    onChange={(e) => setUseWalletBalance(e.target.checked)} 
                                    style={{ accentColor: '#0284c7', width: '18px', height: '18px' }}
                                />
                                <div>
                                    <div style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.9rem' }}>Use FreshWallet Balance</div>
                                    <div style={{ color: '#0369a1', fontSize: '0.8rem' }}>Available: ₹{balance.toFixed(2)}</div>
                                </div>
                            </label>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem', color: '#555' }}>
                            <span>Item Total</span>
                            <span>₹{itemTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem', color: '#555' }}>
                            <span>Handling Fee</span>
                            <span>₹{handlingFee.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem', color: '#2ecc71' }}>
                            <span>Delivery Fee</span>
                            <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
                        </div>

                        {discountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem', color: '#e74c3c', fontWeight: 600 }}>
                                <span>Promo Discount ({appliedPromo.code})</span>
                                <span>-₹{discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        {walletDeduction > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem', color: '#0284c7', fontWeight: 600 }}>
                                <span>Wallet Applied</span>
                                <span>-₹{walletDeduction.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0 0', borderTop: '2px dashed #eee', paddingTop: '15px', fontWeight: 800, fontSize: '1.2rem', color: '#222' }}>
                            <span>To Pay</span>
                            <span>₹{finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);
};

export default Checkout;
