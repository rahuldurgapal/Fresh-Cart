import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import './ProductDetails.css';

import API_BASE from '../config.js';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { cart, addToCart, updateQuantity } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { user } = useAuth();
    const { showToast } = useToast();
    
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                const resSingle = await fetch(`${API_BASE}/api/products/get_single.php?id=${id}`);
                const dataSingle = await resSingle.json();
                
                if (resSingle.ok) {
                    setProduct(dataSingle);
                    const resAll = await fetch(`${API_BASE}/api/products/get.php`);
                    const dataAll = await resAll.json();
                    
                    if (dataAll.records) {
                        const related = dataAll.records
                            .filter(p => p.category_id === dataSingle.category_id && p.id != dataSingle.id)
                            .slice(0, 4);
                        setRelatedProducts(related);
                    }
                    
                    // 3. Fetch Reviews
                    const resRev = await fetch(`${API_BASE}/api/reviews/get_by_product.php?product_id=${id}`);
                    const dataRev = await resRev.json();
                    if (dataRev.records) {
                        setReviews(dataRev.records);
                    }
                } else {
                    setProduct(null);
                }
            } catch(e) {
                console.error(e);
            }
            setLoading(false);
        };
        fetchProductData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return <div style={{textAlign: 'center', padding: '100px'}}>Loading Product Details...</div>;
    }

    if (!product) {
        return (
            <div className="product-not-found" style={{ textAlign: 'center', padding: '100px', minHeight: '60vh' }}>
                <h2>Product not found!</h2>
                <Link to="/" className="btn-primary" style={{ marginTop: '20px' }}>Go Back Home</Link>
            </div>
        );
    }

    const inrPrice = Math.round(product.price);
    const mrpPrice = Math.round(inrPrice * 1.15);
    const formattedUnit = product.unit || "1 unit";

    const cartItem = cart.find(item => item.id === product.id);
    const isWished = isInWishlist(product.id);
    
    const imageUrl = product.image_path ? (product.image_path.startsWith('http') ? product.image_path : `${API_BASE}${product.image_path}`) : '';

    const handleAdd = () => {
        addToCart({
            id: product.id,
            title: product.name,
            image: imageUrl,
            unit: formattedUnit,
            price: inrPrice
        });
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!user || !user.token) {
            showToast('Please login to submit a review.', 'error');
            return;
        }
        
        setSubmittingReview(true);
        try {
            const res = await fetch(`${API_BASE}/api/reviews/create.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ product_id: product.id, user_name: user.name, rating, comment })
            });
            const data = await res.json();
            
            if (res.ok) {
                showToast('Review submitted successfully!', 'success');
                setReviews([{ id: Date.now(), user_name: user.name, rating, comment }, ...reviews]);
                setComment('');
                setRating(5);
            } else {
                showToast(data.message || 'Failed to submit review', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Network error while submitting review.', 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="product-details-container wrapper-details fade-in">
            <button onClick={() => navigate(-1)} className="back-btn">
                <i className="fa-solid fa-arrow-left"></i> Back
            </button>
            <div className="product-details-content">
                <div className="details-left">
                    <div className="image-wrapper">
                        {product.badge && <span className="product-badge details-badge">{product.badge}</span>}
                        <img src={imageUrl} alt={product.name} />
                    </div>
                </div>
                <div className="details-right">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="details-category">
                                <Link to="/">Home</Link> / <Link to={`/categories?cat=${product.category_name}`}>{product.category_name}</Link>
                            </p>
                            <h1 className="details-title">{product.name}</h1>
                        </div>
                        <button 
                            onClick={() => toggleWishlist(product)} 
                            style={{
                                background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '50%',
                                width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: isWished ? 'var(--danger)' : 'var(--text-light)', transition: 'all 0.2s',
                                fontSize: '1.2rem'
                            }}
                        >
                            <i className={isWished ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                        </button>
                    </div>
                    <p className="details-unit">{formattedUnit}</p>
                    
                    <div className="details-pricing">
                        <span className="current-price">₹{inrPrice}</span>
                        <span className="mrp-price">MRP ₹{mrpPrice}</span>
                        <span className="discount-tag">15% OFF</span>
                    </div>
                    <p className="tax-info">(Inclusive of all taxes)</p>

                    <div className="details-action">
                        {cartItem ? (
                            <div className="product-qty-controls" style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--primary)', 
                                color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', width: '100%', maxWidth: '350px', fontSize: '1.4rem'
                            }}>
                                <button onClick={() => updateQuantity(product.id, -1)} style={{background:'none', border:'none', color:'white', fontSize:'1.6rem', cursor:'pointer'}}>-</button>
                                <span>{cartItem.quantity}</span>
                                <button onClick={() => updateQuantity(product.id, 1)} style={{background:'none', border:'none', color:'white', fontSize:'1.6rem', cursor:'pointer'}}>+</button>
                            </div>
                        ) : (
                            <button className="btn-add-large" onClick={handleAdd}>Add to Cart</button>
                        )}
                    </div>

                    <div className="product-about">
                        <h3>About this Product</h3>
                        <p style={{ whiteSpace: 'pre-wrap' }}>
                            {product.description || 
                            `Looking for the best quality ${product.name}? You're in the right place! We ensure that you get nothing but the freshest and finest quality. Sourced from our trusted partners, this ${product.category_name} item is perfect for your daily household needs. Experience premium taste and nutrition that you and your family deserve.`}
                        </p>
                        <ul className="about-features">
                            <li><strong>Storage Tips:</strong> {product.storage_tips || 'Keep in a cool and dry place.'}</li>
                            <li><strong>Shelf Life:</strong> {product.shelf_life || 'Best before 3 days from delivery.'}</li>
                            <li><strong>Product Type:</strong> {product.product_type || (product.category_name === 'Meat & Seafood' ? 'Fresh Non-Veg' : '100% Vegetarian')}</li>
                        </ul>
                    </div>

                    <div className="product-about" style={{ marginTop: '20px' }}>
                        <h3>Leave a Review</h3>
                        {user ? (
                            <form onSubmit={submitReview} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600 }}>Rating</label>
                                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', width: '100px' }}>
                                        {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Star</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dark)', fontWeight: 600 }}>Your Feedback</label>
                                    <textarea 
                                        value={comment} onChange={(e) => setComment(e.target.value)} 
                                        placeholder="What did you like or dislike?"
                                        rows="3" required
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn-primary" disabled={submittingReview} style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        ) : (
                            <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>
                                Please <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>log in</Link> to write a review.
                            </p>
                        )}
                    </div>

                    <div className="product-about" style={{ marginTop: '20px' }}>
                        <h3>Customer Reviews ⭐</h3>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {reviews.length > 0 ? reviews.map(rev => (
                                <div key={rev.id} style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <strong style={{ color: 'var(--text-dark)' }}>{rev.user_name}</strong>
                                        <span style={{ background: '#2ecc71', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{rev.rating} <i className="fa-solid fa-star"></i></span>
                                    </div>
                                    <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>"{rev.comment}"</p>
                                </div>
                            )) : (
                                <p style={{ color: 'var(--text-light)' }}>No reviews yet. Be the first to review!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div style={{ marginTop: '4rem' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Similar Products</h2>
                    <div className="products" style={{ margin: 0, padding: 0 }}>
                        {relatedProducts.map(rel => (
                            <ProductCard key={rel.id} product={rel} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
