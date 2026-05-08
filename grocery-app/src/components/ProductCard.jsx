import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import API_BASE from '../config.js';

const ProductCard = ({ product }) => {
    const { cart, addToCart, updateQuantity } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [aiLoading, setAiLoading] = useState(false);
    
    const inrPrice      = Math.round(product.price);
    const mrpPrice      = Math.round(inrPrice * 1.15);
    const formattedUnit = product.unit || "1 unit";

    const imageUrl = product.image_path
        ? (product.image_path.startsWith('http') ? product.image_path : `${API_BASE}${product.image_path}`)
        : product.image;

    const cartItem  = cart.find(item => item.id === product.id);
    const isWished  = isInWishlist(product.id);
    const prodName  = product.name || product.title;

    // Out of stock: stock field exists AND is exactly 0
    const isOutOfStock = product.stock !== undefined && product.stock !== null && Number(product.stock) === 0;

    // Stable pseudo-random rating
    const mockRating  = (4 + ((prodName.length + String(product.id).charCodeAt(0)) % 10) / 10).toFixed(1);
    const mockReviews = 10 + (prodName.length * 5);

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) return;
        addToCart({
            id:    product.id,
            title: prodName,
            image: imageUrl,
            unit:  formattedUnit,
            price: inrPrice
        });
    };

    const handleUpdateQty = (e, change) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product.id, change);
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    };

    const handleAiSubstitute = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setAiLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/ai/get_substitute.php?product_id=${product.id}`);
            const data = await res.json();
            if (res.ok && data.substitute) {
                showToast(`AI found an alternative: ${data.substitute.name}`, 'success');
                navigate(`/product/${data.substitute.id}`);
            } else {
                showToast('Sorry, AI could not find a suitable substitute.', 'error');
            }
        } catch (err) {
            showToast('Network error while asking AI.', 'error');
        } finally {
            setAiLoading(false);
        }
    };

    const handleClick = () => navigate(`/product/${product.id}`);

    return (
        <div
            className="product-card fade-in"
            onClick={handleClick}
            style={{
                cursor: 'pointer',
                position: 'relative',
                opacity: isOutOfStock ? 0.75 : 1,
            }}
        >
            {/* Wishlist button */}
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

            {/* Product Image */}
            <div className="product-img-container" style={{ textAlign: 'center', position: 'relative' }}>
                <img src={imageUrl} alt={prodName} className="product-img"
                    style={{ filter: isOutOfStock ? 'grayscale(60%)' : 'none' }} />

                {/* Out of Stock overlay badge */}
                {isOutOfStock ? (
                    <span style={{
                        position: 'absolute', top: 6, left: 6,
                        background: '#dc2626', color: '#fff',
                        fontSize: '0.7rem', fontWeight: 700,
                        padding: '3px 10px', borderRadius: '20px',
                        letterSpacing: '0.04em', textTransform: 'uppercase'
                    }}>Out of Stock</span>
                ) : (
                    mockRating >= 4.5 && (
                        <span className="product-badge" style={{ position: 'absolute', top: 0, left: 0 }}>Bestseller</span>
                    )
                )}
            </div>

            {/* Product Info */}
            <div className="product-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#333' }}>
                        {mockRating} <i className="fa-solid fa-star" style={{ color: '#f39c12', fontSize: '0.7rem', marginLeft: '3px' }}></i>
                    </div>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>({mockReviews})</span>
                </div>
                <div className="product-title">{prodName}</div>
            </div>

            {/* Footer */}
            <div className="product-footer">
                <div className="price-container">
                    <span className="product-price">₹{inrPrice}</span>
                    <span className="product-mrp">₹{mrpPrice}</span>
                </div>

                {isOutOfStock ? (
                    /* Out of Stock — disabled button & AI Substitute */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button
                            disabled
                            style={{
                                padding: '5px 12px', borderRadius: '6px',
                                border: '1px solid #fca5a5',
                                background: '#fee2e2', color: '#dc2626',
                                fontSize: '0.78rem', fontWeight: 600,
                                cursor: 'not-allowed', whiteSpace: 'nowrap'
                            }}
                        >
                            Out of Stock
                        </button>
                        <button
                            onClick={handleAiSubstitute}
                            disabled={aiLoading}
                            style={{
                                padding: '4px 6px', borderRadius: '6px',
                                border: '1px solid #d8b4fe',
                                background: 'transparent', color: '#a855f7',
                                fontSize: '0.7rem', fontWeight: 600,
                                cursor: aiLoading ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                            }}
                        >
                            {aiLoading ? <span className="spinner" style={{width:'10px', height:'10px', borderWidth:'1px'}}></span> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                            AI Substitute
                        </button>
                    </div>
                ) : cartItem ? (
                    /* Quantity Controls */
                    <div className="product-qty-controls" style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'var(--primary)', color: 'white',
                        padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold'
                    }}>
                        <button onClick={(e) => handleUpdateQty(e, -1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}>-</button>
                        <span>{cartItem.quantity}</span>
                        <button onClick={(e) => handleUpdateQty(e, 1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}>+</button>
                    </div>
                ) : (
                    /* Add to Cart */
                    <button className="add-to-cart" onClick={handleAdd}>Add</button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
