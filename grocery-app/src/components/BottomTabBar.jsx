import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './BottomTabBar.css';

const BottomTabBar = () => {
    const { totalItems, toggleCart } = useCart();

    return (
        <nav className="bottom-tab-bar">
            <NavLink to="/" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
                <i className="fa-solid fa-house"></i>
                <span>Home</span>
            </NavLink>
            <NavLink to="/categories" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
                <i className="fa-solid fa-grip"></i>
                <span>Categories</span>
            </NavLink>
            <button onClick={() => toggleCart()} className="tab-item" style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}>
                <div className="tab-icon-wrapper">
                    <i className="fa-solid fa-basket-shopping"></i>
                    {totalItems > 0 && <span className="tab-badge">{totalItems}</span>}
                </div>
                <span>Cart</span>
            </button>
            <NavLink to="/profile" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
                <i className="fa-regular fa-user"></i>
                <span>Profile</span>
            </NavLink>
        </nav>
    );
};

export default BottomTabBar;
