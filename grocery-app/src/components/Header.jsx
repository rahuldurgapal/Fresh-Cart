import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import LocationModal from './LocationModal';
import logo from '../assets/logo.png';

import API_BASE from '../config.js';

const Header = () => {
    const { totalItems, totalPrice, toggleCart } = useCart();
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, login, logout } = useAuth();
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('B-45, Phase 1, New Delhi');
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const debounceRef = useRef(null);

    const fetchSearchResults = useCallback(async (q) => {
        if (!q.trim()) { setSearchResults([]); setIsSearching(false); return; }
        setIsSearching(true);
        try {
            const res  = await fetch(`${API_BASE}/api/products/search.php?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setSearchResults(data.records ? data.records.slice(0, 6) : []);
        } catch (e) { setSearchResults([]); }
        setIsSearching(false);
    }, []);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        debounceRef.current = setTimeout(() => fetchSearchResults(searchQuery), 350);
        return () => clearTimeout(debounceRef.current);
    }, [searchQuery, fetchSearchResults]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchItemClick = (id) => {
        setIsSearchOpen(false);
        setSearchQuery('');
        navigate(`/product/${id}`);
    };

    const handleCartClick = (e) => {
        e.preventDefault();
        toggleCart();
    };

    return (
        <>
            <header className="blinkit-header">
                <div className="nav-container top-nav">
                    <div className="nav-left">
                        <Link to="/" className="logo-blinkit" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={logo} alt="FreshCart Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                            FreshCart
                        </Link>
                        <div className="delivery-info" onClick={() => setIsLocationModalOpen(true)}>
                            <div className="delivery-time">Delivery in 10 minutes</div>
                            <div className="delivery-location">
                                {selectedLocation} <i className="fa-solid fa-caret-down"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div className="search-bar-container" ref={searchRef}>
                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search for 'milk' or 'bread'" 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsSearchOpen(true);
                            }}
                            onFocus={() => setIsSearchOpen(true)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchQuery.trim()) {
                                    setIsSearchOpen(false);
                                    navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
                                }
                            }}
                        />
                        {isSearchOpen && (
                            <div className="search-dropdown-results" style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, 
                                background: 'var(--card-bg)', borderRadius: '12px', marginTop: '8px',
                                boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', zIndex: 1000, overflow: 'hidden'
                            }}>
                                {searchQuery.trim() === '' ? (
                                    <div style={{ padding: '16px' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase' }}>Trending Searches</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {['Milk', 'Bread', 'Eggs', 'Chips', 'Apple', 'Juice'].map(chip => (
                                                <button 
                                                    key={chip}
                                                    onClick={() => {
                                                        setSearchQuery(chip);
                                                    }}
                                                    style={{
                                                        padding: '6px 12px', borderRadius: '16px', border: '1px solid var(--border)',
                                                        background: 'var(--bg-color)', color: 'var(--text-dark)', fontSize: '0.85rem',
                                                        cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.borderColor = 'var(--primary)'}
                                                    onMouseOut={(e) => e.target.style.borderColor = 'var(--border)'}
                                                >
                                                    <i className="fa-solid fa-arrow-trend-up" style={{marginRight: '6px', color: 'var(--primary)'}}></i> {chip}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : isSearching ? (
                                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-light)' }}>Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    <>
                                        {searchResults.map(item => (
                                            <div key={item.id} onClick={() => handleSearchItemClick(item.id)} style={{
                                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                                                cursor: 'pointer', borderBottom: '1px solid var(--border)',
                                                transition: 'background 0.15s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background='var(--bg-color)'}
                                            onMouseLeave={e => e.currentTarget.style.background='transparent'}
                                            >
                                                <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                                                    {item.image_path
                                                        ? <img src={item.image_path.startsWith('http') ? item.image_path : `${API_BASE}${item.image_path}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        : <span style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>🛒</span>
                                                    }
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.92rem' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>in {item.category_name} · ₹{item.price}</div>
                                                </div>
                                            </div>
                                        ))}
                                        <div 
                                            onClick={() => {
                                                setIsSearchOpen(false);
                                                navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
                                            }}
                                            style={{ 
                                                padding: '12px 16px', textAlign: 'center', color: 'var(--primary)', 
                                                fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                                                background: 'rgba(22, 163, 74, 0.05)'
                                            }}
                                        >
                                            See all results for "{searchQuery}"
                                        </div>
                                    </>
                                ) : searchQuery.trim() ? (
                                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-light)' }}>
                                        No results found for "{searchQuery}"
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>

                    <div className="nav-right">
                        <button onClick={toggleTheme} style={{
                            background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--text-dark)', cursor: 'pointer', padding: '5px'
                        }}>
                            {isDarkMode ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
                        </button>
                        
                        <Link to="/wishlist" className="desktop-only" style={{
                            color: 'var(--danger)', fontSize: '1.2rem', textDecoration: 'none', padding: '5px'
                        }}>
                            <i className="fa-solid fa-heart"></i>
                        </Link>
                        
                        {user ? (
                            <>
                                <Link to="/my-orders" className="desktop-only" style={{ color: 'var(--text-dark)', fontSize: '0.85rem', textDecoration: 'none', padding: '5px 8px', borderRadius: '8px', background: 'var(--bg-color)', fontWeight: 500 }}>
                                    <i className="fa-solid fa-box" style={{ marginRight: '5px', color: 'var(--primary)' }}></i>Orders
                                </Link>
                                <Link to="/profile" className="user-profile-btn" style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--text-dark)', textDecoration: 'none' }}>
                                    Hi, {user.name} <i className="fa-regular fa-circle-user" style={{marginLeft: '5px', fontSize: '1.2rem', verticalAlign: 'middle'}}></i>
                                </Link>
                            </>
                        ) : (
                            <Link to="/login" className="login-link">Login</Link>
                        )}

                        <button onClick={handleCartClick} className="cart-btn-blinkit desktop-only" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', position: 'relative' }}>
                            <i className="fa-solid fa-cart-shopping"></i>
                            {totalItems > 0 && (
                                <span className="mobile-cart-badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {totalItems}
                                </span>
                            )}
                            <div className="cart-info desktop-cart-text">
                                <span className="cart-items">{totalItems} items</span>
                                <span className="cart-total">₹{totalPrice}</span>
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            <div className="categories-subnav">
                <div className="subnav-container">
                    <Link to="/categories?cat=All">All Categories</Link>
                    <Link to="/categories?cat=Fruits">Fruits & Vegetables</Link>
                    <Link to="/categories?cat=Dairy">Dairy & Breakfast</Link>
                    <Link to="/categories?cat=Meat">Meat & Seafood</Link>
                    <Link to="/categories?cat=Bakery">Bakery & Biscuits</Link>
                    <Link to="/categories?cat=Snacks">Snacks & Munchies</Link>
                    <Link to="/categories?cat=Beverages">Cold Drinks & Juices</Link>
                </div>
            </div>
            <LocationModal 
                isOpen={isLocationModalOpen} 
                onClose={() => setIsLocationModalOpen(false)} 
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
            />
        </>
    );
};

export default Header;
