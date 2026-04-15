import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

import API_BASE from '../config.js';

const Categories = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default');

    const [products, setProducts] = useState([]);
    const [categoriesList, setCategoriesList] = useState([{ name: 'All', id: 'All', icon: '🧺' }]);

    const fetchProductsAndCategories = async () => {
        try {
            const pRes = await fetch(`${API_BASE}/api/products/get.php`);
            const pData = await pRes.json();
            if(pData.records) setProducts(pData.records);

            const cRes = await fetch(`${API_BASE}/api/categories/get.php`);
            const cData = await cRes.json();
            if(cData.records) {
                const standardCats = cData.records.map(cat => ({ name: cat.name, id: cat.name, icon: '🛒' }));
                setCategoriesList([{ name: 'All', id: 'All', icon: '🧺' }, ...standardCats]);
            }
        } catch(e) { console.error(e); }
    };

    useEffect(() => {
        fetchProductsAndCategories();
    }, []); // Only fetch once on mount

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cat = params.get('cat');
        const search = params.get('search');
        
        if (search) {
            setSearchQuery(search);
            setSelectedCategory('All'); // Search is global by default
        } else {
            setSearchQuery('');
            if (cat) setSelectedCategory(cat);
        }
    }, [location]);

    let filteredProducts = [...products];

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name?.toLowerCase().includes(q) || 
            p.description?.toLowerCase().includes(q) ||
            p.category_name?.toLowerCase().includes(q)
        );
    } else if (selectedCategory !== 'All') {
        filteredProducts = filteredProducts.filter(p => (p.category_name || p.category) === selectedCategory);
    }

    if (sortBy === 'priceAsc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'nameAsc') {
        filteredProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }


    return (
        <div className="blinkit-layout">
            <aside className="blinkit-sidebar" id="category-sidebar">
                {categoriesList.map(cat => (
                    <button 
                        key={cat.id}
                        className={`sidebar-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                    >
                        <div className="cat-img-wrap" style={{ fontSize: '1.5rem', background: '#f8f9fa' }}>
                            {cat.icon}
                        </div>
                        <span>{cat.name}</span>
                    </button>
                ))}
            </aside>

            <main className="blinkit-main" style={{ maxWidth: '1280px', margin: '1.5rem auto', padding: '0 24px', background: 'transparent', boxShadow: 'none', border: 'none' }}>
                <button onClick={() => navigate(-1)} className="back-btn">
                    <i className="fa-solid fa-arrow-left"></i> Back
                </button>
                <div className="category-header-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>
                        {searchQuery 
                            ? `Search results for "${searchQuery}"` 
                            : (categoriesList.find(c => c.id === selectedCategory)?.name || 'Categories')
                        }
                    </h2>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)',
                            background: 'var(--card-bg)', color: 'var(--text-dark)', outline: 'none', cursor: 'pointer'
                        }}
                    >
                        <option value="default">Sort by: Recommended</option>
                        <option value="priceAsc">Price: Low to High</option>
                        <option value="priceDesc">Price: High to Low</option>
                        <option value="nameAsc">Name: A to Z</option>
                    </select>
                </div>
                <div className="products" style={{ margin: 0, maxWidth: 'none', padding: 0 }}>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
                            No products found.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Categories;
