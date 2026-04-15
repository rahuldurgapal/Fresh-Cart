import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './SidebarCart.css';

const SidebarCart = () => {
    const { cart, isCartOpen, toggleCart, updateQuantity, totalPrice, totalItems } = useCart();

    if (!isCartOpen) return null;

    return (
        <div className="sidebar-cart-overlay">
            <div className="sidebar-cart-backdrop" onClick={toggleCart}></div>
            <div className="sidebar-cart-drawer slide-in-right">
                <div className="sidebar-cart-header">
                    <h2>My Cart ({totalItems} items)</h2>
                    <button className="close-cart-btn" onClick={toggleCart}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="sidebar-cart-body">
                    {cart.length === 0 ? (
                        <div className="empty-cart-message">
                            <i className="fa-solid fa-basket-shopping empty-icon"></i>
                            <p>You don't have any items in your cart.</p>
                            <button className="btn-primary" onClick={toggleCart}>Start Shopping</button>
                        </div>
                    ) : (
                        <div className="sidebar-cart-content-wrapper">
                            <div className="delivery-progress-container">
                                {totalPrice >= 500 ? (
                                    <div className="delivery-progress-msg success">
                                        <i className="fa-solid fa-truck-fast"></i> 🎉 You are eligible for <strong>FREE Delivery!</strong>
                                    </div>
                                ) : (
                                    <div className="delivery-progress-msg">
                                        <i className="fa-solid fa-truck"></i> Add <strong>₹{500 - totalPrice}</strong> more for <strong>FREE Delivery!</strong>
                                    </div>
                                )}
                                <div className="delivery-progress-bar-bg">
                                    <div 
                                        className={`delivery-progress-fill ${totalPrice >= 500 ? 'success-fill' : ''}`}
                                        style={{ width: `${Math.min((totalPrice / 500) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="sidebar-cart-items">
                            {cart.map(item => (
                                <div key={item.id} className="sidebar-cart-item">
                                    <img src={item.image} alt={item.title} />
                                    <div className="sidebar-item-details">
                                        <h4>{item.title}</h4>
                                        <p className="sidebar-item-unit">{item.unit}</p>
                                        <div className="sidebar-item-price">₹{item.price}</div>
                                    </div>
                                    <div className="sidebar-qty-controls">
                                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="sidebar-cart-footer">
                        <div className="sidebar-subtotal">
                            <span>Subtotal</span>
                            <span>₹{totalPrice}</span>
                        </div>
                        <p className="sidebar-tax-note">Delivery charges and taxes calculated at checkout.</p>
                        <Link to="/checkout" className="btn-proceed-checkout" onClick={toggleCart}>
                            Proceed to Checkout <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SidebarCart;
