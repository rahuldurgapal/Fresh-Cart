import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        const localWishlist = localStorage.getItem('freshWishlist');
        return localWishlist ? JSON.parse(localWishlist) : [];
    });
    const { addToast } = useToast() || { addToast: () => {} }; // graceful fallback

    useEffect(() => {
        localStorage.setItem('freshWishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const isInWishlist = (id) => wishlist.some(item => item.id === id);

    const toggleWishlist = (product) => {
        if (isInWishlist(product.id)) {
            setWishlist(prev => prev.filter(item => item.id !== product.id));
            if(addToast) addToast('Removed from wishlist', 'info');
        } else {
            setWishlist(prev => [...prev, product]);
            if(addToast) addToast('Added to wishlist ❤️', 'success');
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
