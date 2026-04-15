import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const localUser = localStorage.getItem('freshUser');
        return localUser ? JSON.parse(localUser) : null;
    });

    const login = (authData) => {
        //authData contains { message, token, user }
        const fullProfile = { ...authData.user, token: authData.token }; 
        setUser(fullProfile);
        localStorage.setItem('freshUser', JSON.stringify(fullProfile));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('freshUser');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
