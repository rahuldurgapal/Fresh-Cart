import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API_BASE from '../config';

const RecipeScannerModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                setResults(null);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleScan = async () => {
        if (!image) return;
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch(`${API_BASE}/api/ai/recipe_to_cart.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_base64: image })
            });
            const data = await res.json();
            
            if (res.ok) {
                setResults(data);
            } else {
                setError(data.message || 'Failed to scan recipe.');
            }
        } catch (err) {
            setError('Network error. Make sure the backend is running and the API key is valid.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAll = () => {
        if (!results || !results.matched_products) return;
        results.matched_products.forEach(product => {
            addToCart(product, 1);
        });
        onClose();
        navigate('/cart');
    };

    return (
        <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 10000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', background: 'var(--card-bg)' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, #f3e8ff 0%, #fdf2f8 100%)', borderRadius: '12px 12px 0 0' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7' }}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i> AI Recipe Scanner
                    </h2>
                    <button className="close-btn" onClick={onClose} style={{ color: '#a855f7' }}>&times;</button>
                </div>
                <div className="modal-body" style={{ padding: '24px' }}>
                    
                    {!results ? (
                        <>
                            <p style={{ color: 'var(--text-light)', marginBottom: '16px', textAlign: 'center' }}>
                                Upload a photo of a recipe from a book, Instagram, or a screenshot, and our AI will automatically find the ingredients for you!
                            </p>
                            
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                style={{
                                    border: '2px dashed #d8b4fe',
                                    borderRadius: '16px',
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: image ? 'transparent' : '#faf5ff',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {image ? (
                                    <img src={image} alt="Recipe" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                                ) : (
                                    <div style={{ color: '#a855f7' }}>
                                        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '3rem', marginBottom: '12px' }}></i>
                                        <h3 style={{ margin: 0 }}>Tap to Upload Recipe</h3>
                                    </div>
                                )}
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleFileChange} 
                            />

                            {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', marginTop: '16px', fontSize: '0.9rem' }}>{error}</div>}

                            <button 
                                className="btn-primary" 
                                onClick={handleScan}
                                disabled={!image || loading}
                                style={{ width: '100%', marginTop: '20px', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', border: 'none' }}
                            >
                                {loading ? <span className="spinner"></span> : <i className="fa-solid fa-bolt"></i>} 
                                {loading ? ' Analyzing Recipe...' : ' Scan with AI'}
                            </button>
                        </>
                    ) : (
                        <>
                            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 600 }}>
                                <i className="fa-solid fa-circle-check"></i> Found {results.matched_products.length} matching products!
                            </div>
                            
                            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                                {results.matched_products.map((p, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: '1px solid var(--border)' }}>
                                        <img src={p.image_path} alt={p.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Mapped from: {p.ai_ingredient}</div>
                                        </div>
                                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{Number(p.price).toFixed(0)}</div>
                                    </div>
                                ))}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn-outline" onClick={() => { setResults(null); setImage(null); }} style={{ flex: 1 }}>
                                    Scan Another
                                </button>
                                <button className="btn-primary" onClick={handleAddAll} style={{ flex: 2, background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', border: 'none' }}>
                                    Add All to Cart
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeScannerModal;
