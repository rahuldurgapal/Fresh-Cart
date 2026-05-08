import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import API_BASE from '../config.js';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        const localData = localStorage.getItem('freshCart');
        return localData ? JSON.parse(localData) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    // Cross-Sell State
    const [crossSellItem, setCrossSellItem] = useState(null);
    const [hasCrossSold, setHasCrossSold] = useState(false);

    // We only access addToast if ToastContext Provider is actually rendering above it
    const toastContext = useToast(); 

    useEffect(() => {
        localStorage.setItem('freshCart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });

        // Trigger Cross-sell logic
        if (!hasCrossSold && !cart.some(item => item.id === product.id)) {
            const lowerTitle = product.title.toLowerCase();
            if (lowerTitle.includes('bread') && product.id !== 11) {
                 setCrossSellItem({
                    trigger: product.title,
                    companion: { id: 11, title: 'Amul Butter', price: 55, unit: '100g', image: `${API_BASE}/uploads/products/69e5061f897dd.webp` }
                });
                setHasCrossSold(true);
            } else if (lowerTitle.includes('milk') && product.id !== 13) {
                 setCrossSellItem({
                    trigger: product.title,
                    companion: { id: 13, title: 'Amul Taza Milk', price: 70, unit: '1L', image: `${API_BASE}/uploads/products/69e5061620356.webp` }
                });
                setHasCrossSold(true);
            }
        }

        if (toastContext?.addToast) {
            toastContext.addToast('Item added to cart', 'success');
        }
    };

    const clearCrossSell = () => setCrossSellItem(null);

    const updateQuantity = (id, change) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: item.quantity + change };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('freshCart');
    };
    const toggleCart = () => setIsCartOpen(prev => !prev);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ 
            cart, addToCart, updateQuantity, clearCart, 
            totalItems, totalPrice, isCartOpen, setIsCartOpen, toggleCart,
            crossSellItem, clearCrossSell
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
