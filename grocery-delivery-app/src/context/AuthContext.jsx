import React, { createContext, useContext, useState, useEffect } from 'react';
import API_BASE from '../config.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true); // True while verifying token

    // On app start, verify the stored token with the backend
    useEffect(() => {
        const stored = localStorage.getItem('deliveryAgent');
        if (!stored) {
            setLoading(false);
            return;
        }

        const parsed = JSON.parse(stored);
        if (!parsed?.token) {
            localStorage.removeItem('deliveryAgent');
            setLoading(false);
            return;
        }

        // Verify token with backend — this ensures the right user is loaded
        fetch(`${API_BASE}/api/delivery/verify_token.php`, {
            headers: {
                'Authorization': `Bearer ${parsed.token}`
            }
        })
        .then(r => r.json())
        .then(data => {
            if (data.valid) {
                // Always use FRESH data from server, not stale localStorage
                setAgent({ ...data.agent, token: parsed.token });
            } else {
                // Token invalid or role mismatch — clear everything
                localStorage.removeItem('deliveryAgent');
                setAgent(null);
            }
        })
        .catch(() => {
            // Network error — use cached data as fallback, but verify role
            if (parsed?.role === 'Delivery Agent') {
                setAgent(parsed);
            } else {
                localStorage.removeItem('deliveryAgent');
                setAgent(null);
            }
        })
        .finally(() => setLoading(false));
    }, []);

    const login = (agentData, token) => {
        const full = { ...agentData, token };
        localStorage.setItem('deliveryAgent', JSON.stringify(full));
        setAgent(full);
    };

    const logout = () => {
        localStorage.removeItem('deliveryAgent');
        setAgent(null);
    };

    return (
        <AuthContext.Provider value={{ agent, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

