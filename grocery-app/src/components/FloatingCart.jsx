import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const FloatingCart = () => {
    const { totalItems, totalPrice, toggleCart, isCartOpen } = useCart();

    if (totalItems === 0 || isCartOpen) return null;

    return (
        <div className="floating-cart-container d-mobile-only">
            <button className="floating-cart-btn" onClick={toggleCart}>
                <div className="fc-left">
                    <i className="fa-solid fa-cart-shopping"></i>
                    <div>
                        <div className="fc-items">{totalItems} item{totalItems > 1 && 's'}</div>
                        <div className="fc-price">₹{totalPrice}</div>
                    </div>
                </div>
                <div className="fc-right">
                    View Cart <i className="fa-solid fa-play" style={{ fontSize: '0.8rem', marginLeft: '6px' }}></i>
                </div>
            </button>
        </div>
    );
};

export default FloatingCart;
