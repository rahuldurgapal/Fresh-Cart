import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer blinkit-footer">
            <div className="footer-container">
                <div className="footer-section brand-section">
                    <h2 className="footer-logo">
                        <i className="fa-solid fa-basket-shopping"></i> FreshCart
                    </h2>
                    <p>Your online grocery store for fresh fruits, vegetables, and daily essentials delivered to your doorstep.</p>
                    <div className="social-icons">
                        <a href="#"><i className="fa-brands fa-facebook"></i></a>
                        <a href="#"><i className="fa-brands fa-twitter"></i></a>
                        <a href="#"><i className="fa-brands fa-instagram"></i></a>
                    </div>
                </div>

                <div className="footer-section links-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/categories">Categories</Link></li>
                        <li><Link to="/checkout">Checkout</Link></li>
                        <li><Link to="/login">Login</Link></li>
                    </ul>
                </div>

                <div className="footer-section links-section">
                    <h3>Categories</h3>
                    <ul>
                        <li><Link to="/categories?cat=Fruits">Fruits</Link></li>
                        <li><Link to="/categories?cat=Vegetables">Vegetables</Link></li>
                        <li><Link to="/categories?cat=Dairy">Dairy & Eggs</Link></li>
                        <li><Link to="/categories?cat=Snacks">Snacks</Link></li>
                    </ul>
                </div>

                <div className="footer-section contact-section">
                    <h3>Contact Us</h3>
                    <ul>
                        <li><i className="fa-solid fa-location-dot"></i> 123 Grocery Street, Fresh City, FC 10001</li>
                        <li><i className="fa-solid fa-phone"></i> +1 234 567 8900</li>
                        <li><i className="fa-solid fa-envelope"></i> support@freshcart.com</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} FreshCart Grocery App. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
