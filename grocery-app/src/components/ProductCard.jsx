import React from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../config.js';

const ProductCard = ({ product }) => {
    const { cart, addToCart, updateQuantity } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const navigate = useNavigate();
    
    // Convert to INR or use direct price
    const inrPrice = Math.round(product.price);
    const mrpPrice = Math.round(inrPrice * 1.15);
    const formattedUnit = product.unit || "1 unit";

    const imageUrl = product.image_path ? (product.image_path.startsWith('http') ? product.image_path : `${API_BASE}${product.image_path}`) : product.image;

    const cartItem = cart.find(item => item.id === product.id);
    const isWished = isInWishlist(product.id);
    const prodName = product.name || product.title;
    
    // Stable pseudo-random rating generation based on product title length and id
    const mockRating = (4 + ((prodName.length + String(product.id).charCodeAt(0)) % 10) / 10).toFixed(1);
    const mockReviews = 10 + (prodName.length * 5);

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            id: product.id,
            title: prodName,
            image: imageUrl,
            unit: formattedUnit,
            price: inrPrice
        });
    };

    const handleUpdateQty = (e, change) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product.id, change);
    }

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    }

    const handleClick = () => {
        navigate(`/product/${product.id}`);
    };

    return (
        <div className="product-card fade-in" onClick={handleClick} style={{ cursor: 'pointer', position: 'relative' }}>
            <button 
                onClick={handleWishlist} 
                style={{
                    position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                    background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '50%',
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: isWished ? 'var(--danger)' : 'var(--text-light)', transition: 'all 0.2s',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}
            >
                <i className={isWished ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
            </button>
            <div className="product-img-container" style={{ textAlign: 'center', position: 'relative' }}>
                <img src={imageUrl} alt={prodName} className="product-img" />
                {mockRating >= 4.5 && <span className="product-badge" style={{position: 'absolute', top: 0, left: 0}}>Bestseller</span>}
            </div>
            
            <div className="product-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#333' }}>
                        {mockRating} <i className="fa-solid fa-star" style={{ color: '#f39c12', fontSize: '0.7rem', marginLeft: '3px' }}></i>
                    </div>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>({mockReviews})</span>
                </div>

                <div className="product-title">{prodName}</div>
            </div>

            <div className="product-footer">
                <div className="price-container">
                    <span className="product-price">₹{inrPrice}</span>
                    <span className="product-mrp">₹{mrpPrice}</span>
                </div>
                {cartItem ? (
                    <div className="product-qty-controls" style={{
                        display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--primary)', 
                        color: 'white', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold'
                    }}>
                        <button onClick={(e) => handleUpdateQty(e, -1)} style={{background:'none', border:'none', color:'white', fontSize:'1.1rem', cursor:'pointer'}}>-</button>
                        <span>{cartItem.quantity}</span>
                        <button onClick={(e) => handleUpdateQty(e, 1)} style={{background:'none', border:'none', color:'white', fontSize:'1.1rem', cursor:'pointer'}}>+</button>
                    </div>
                ) : (
                    <button className="add-to-cart" onClick={handleAdd}>
                        Add
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
