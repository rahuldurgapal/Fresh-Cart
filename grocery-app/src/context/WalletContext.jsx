import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [balance, setBalance] = useState(() => {
        const localBalance = localStorage.getItem('freshWalletBalance');
        // Give new users a $10.00 starting balance as a welcome bonus!
        return localBalance ? parseFloat(localBalance) : 10.00;
    });

    useEffect(() => {
        localStorage.setItem('freshWalletBalance', balance.toFixed(2));
    }, [balance]);

    const useBalance = (amount) => {
        if (amount > balance) return false;
        setBalance(prev => prev - amount);
        return true;
    };

    const addCashback = (amount) => {
        setBalance(prev => prev + amount);
    };

    return (
        <WalletContext.Provider value={{ balance, useBalance, addCashback }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => useContext(WalletContext);
