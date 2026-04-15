import React from 'react';
import { useCart } from '../context/CartContext';
import './CrossSellModal.css';

const CrossSellModal = () => {
    const { crossSellItem, clearCrossSell, addToCart } = useCart();

    if (!crossSellItem) return null;

    const handleAddCompanion = () => {
        addToCart(crossSellItem.companion);
        clearCrossSell();
    };

    return (
        <div className="cross-sell-overlay">
            <div className="cross-sell-modal slide-up-animation">
                <button className="close-modal-btn" onClick={clearCrossSell}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                <div className="modal-header-cs">
                    <span className="sparkle-icon">✨</span>
                    <h3>Perfect Pairing!</h3>
                </div>
                <p className="cs-subtitle">People who bought <strong>{crossSellItem.trigger}</strong> also bought:</p>
                
                <div className="cs-product-card">
                    <img src={crossSellItem.companion.image} alt={crossSellItem.companion.title} />
                    <div className="cs-details">
                        <h4>{crossSellItem.companion.title}</h4>
                        <p>{crossSellItem.companion.unit}</p>
                        <div className="cs-price">₹{crossSellItem.companion.price}</div>
                    </div>
                </div>

                <div className="cs-actions">
                    <button className="btn-secondary-cs" onClick={clearCrossSell}>No Thanks</button>
                    <button className="btn-primary-cs" onClick={handleAddCompanion}>Add to Cart</button>
                </div>
            </div>
        </div>
    );
};

export default CrossSellModal;
