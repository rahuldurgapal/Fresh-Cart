import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

import API_BASE from '../config.js';

const FALLBACK_BANNERS = [
    { title: "Fresh Groceries,", subtitle: "Delivered Fast", desc: "Get the best quality fruits, vegetables, and daily essentials delivered to your doorstep.", bg: "linear-gradient(135deg, #d4f1e1 0%, #bbf7d0 100%)", color: "#16a34a", button_text: "Shop Now", button_link: "#products-section" },
    { title: "Weekend Sale!", subtitle: "Flat 50% Off", desc: "Stock up on snacks and beverages for the weekend. Offer valid till Sunday midnight.", bg: "linear-gradient(135deg, #fff2e6 0%, #ffd9b3 100%)", color: "#e67e22", button_text: "Grab Deals", button_link: "/categories" },
    { title: "Farm Fresh", subtitle: "Winter Veggies", desc: "Sourced directly from local farms. Taste the crispness of winter harvest today.", bg: "linear-gradient(135deg, #e6f9ff 0%, #b3ecff 100%)", color: "#3498db", button_text: "Explore Now", button_link: "/categories" }
];

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState(FALLBACK_BANNERS);

    const fetchBanners = async () => {
        try {
            const res  = await fetch(`${API_BASE}/api/banners/banners.php`);
            const data = await res.json();
            if (data.records && data.records.length > 0) {
                const active = data.records.filter(b => b.status === 'Active');
                if (active.length > 0) {
                    setBanners(active.map(b => ({
                        title:       b.title,
                        subtitle:    b.subtitle || '',
                        desc:        b.subtitle || 'Shop fresh products at the best prices.',
                        bg:          b.image_path
                            ? `url(${API_BASE}${b.image_path}) center/cover no-repeat`
                            : `linear-gradient(135deg, ${b.bg_color}cc, ${b.bg_color}66)`,
                        color:       b.bg_color || '#16a34a',
                        button_text: b.button_text || 'Shop Now',
                        button_link: b.button_link || '/'
                    })));
                }
            }
        } catch (e) { /* use fallback */ }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/products/get.php`);
            const data = await response.json();
            if (data.records) setProducts(data.records);
        } catch(e) { console.error(e); }
    };

    useEffect(() => {
        fetchBanners();
        fetchProducts();
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % banners.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    // Group products by category_name
    const grouped = products.reduce((acc, product) => {
        const cat = product.category_name || product.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {});

    const scrollContainer = (id, dir) => {
        const container = document.getElementById(`scroll-${id.replace(/\s+/g, '-')}`);
        if(container) {
            container.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
        }
    };

    const categoriesList = Object.keys(grouped);

    return (
        <>
            {/* Hero Section */}
            <section className="hero fade-in">
                <div className="hero-banner" style={{ background: banners[currentSlide].bg, transition: 'background 0.5s ease', position: 'relative' }}>
                    <div className="hero-content" key={currentSlide} style={{ animation: 'fadeIn 0.5s ease' }}>
                        <h1>{banners[currentSlide].title} <br/><span style={{ color: banners[currentSlide].color }}>{banners[currentSlide].subtitle}</span></h1>
                        <p>{banners[currentSlide].desc}</p>
                        <a href={banners[currentSlide].button_link || '#products-section'} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', background: banners[currentSlide].color, display: 'inline-flex', alignItems: 'center' }}>
                            {banners[currentSlide].button_text || 'Shop Now'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                        </a>
                    </div>
                    
                    <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
                        {banners.map((_, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setCurrentSlide(idx)}
                                style={{
                                    width: idx === currentSlide ? '24px' : '8px', 
                                    height: '8px', 
                                    borderRadius: '4px', 
                                    background: idx === currentSlide ? banners[currentSlide].color : 'rgba(0,0,0,0.2)',
                                    border: 'none', 
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Shop by Category Section (Beautiful Cards) */}
            <section style={{ maxWidth: '1280px', margin: '2rem auto 2rem', padding: '0 1rem' }} className="fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '12px' }}>
                    {categoriesList.map(cat => {
                        // Picking one image from the category to act as thumbnail
                        const catImage = grouped[cat][0].image;
                        return (
                            <Link to={`/categories?cat=${cat}`} key={cat} style={{ textDecoration: 'none' }}>
                                <div className="category-card" style={{ 
                                    background: '#fff', 
                                    borderRadius: '12px', 
                                    overflow: 'hidden', 
                                    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '12px',
                                    border: '1px solid #f0f0f0'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = '0 6px 12px -2px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px -1px rgba(0, 0, 0, 0.05)';
                                }}
                                >
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', marginBottom: '8px', background: '#f8f9fa' }}>
                                        {catImage && <img src={catImage.startsWith('http') ? catImage : `${API_BASE}${catImage}`} alt={cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                    </div>
                                    <span style={{ color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.1 }}>{cat}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{grouped[cat].length} Items</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Trending / Grouped Products Section */}
            <section className="categories" id="products-section" style={{ marginBottom: '1rem', padding: '0 1rem', maxWidth: '1280px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--text-dark)', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 800 }}>Explore Our Aisle</h2>
                <div id="products-container" style={{ display: 'block' }}>
                    {Object.entries(grouped).map(([category, items]) => (
                        <div key={category} className="category-group-section" style={{ marginBottom: '1.5rem', background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f5f5f5' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px dashed #eee', paddingBottom: '10px' }}>
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-basket-shopping" style={{fontSize: '1rem'}}></i> {category}
                                </h3>
                                <Link to={`/categories?cat=${category}`} style={{ color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.85rem', background: '#f0f0f0', padding: '6px 12px', borderRadius: '20px' }}>
                                    View All <i className="fa-solid fa-angle-right" style={{marginLeft: '4px'}}></i>
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                {/* Left Scroll Button */}
                                <button 
                                    onClick={() => scrollContainer(category, 'left')}
                                    style={{ position: 'absolute', left: '-15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', color: 'var(--text-dark)' }}
                                    className="hide-on-mobile"
                                >
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                
                                <div id={`scroll-${category.replace(/\s+/g, '-')}`} className="products-horizontal-scroll" style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'none', scrollBehavior: 'smooth', scrollSnapType: 'x mandatory' }}>
                                    {items.map(product => (
                                        <div key={product.id} className="product-card-wrap" style={{ scrollSnapAlign: 'start', scrollMarginLeft: '16px' }}>
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>

                                {/* Right Scroll Button */}
                                <button 
                                    onClick={() => scrollContainer(category, 'right')}
                                    style={{ position: 'absolute', right: '-15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', color: 'var(--text-dark)' }}
                                    className="hide-on-mobile"
                                >
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default Home;
