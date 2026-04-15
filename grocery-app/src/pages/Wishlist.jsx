import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
    const { wishlist } = useWishlist();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="blinkit-main" style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 24px', background: 'transparent', boxShadow: 'none', border: 'none' }}>
            <button onClick={() => navigate(-1)} className="back-btn">
                <i className="fa-solid fa-arrow-left"></i> Back
            </button>
            <div className="category-header-main" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>My Wishlist ❤️</h1>
                <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
                    {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                </p>
            </div>

            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <i className="fa-regular fa-heart" style={{ fontSize: '4rem', color: '#e0e0e0', marginBottom: '1rem' }}></i>
                    <h2 style={{ color: 'var(--text-dark)', marginBottom: '1rem' }}>Your wishlist is empty!</h2>
                    <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Save items you love so you can easily find them later.</p>
                    <Link to="/categories" className="btn-primary" style={{ textDecoration: 'none' }}>Explore Products</Link>
                </div>
            ) : (
                <div className="products" style={{ margin: 0, maxWidth: 'none', padding: 0 }}>
                    {wishlist.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </main>
    );
};

export default Wishlist;
