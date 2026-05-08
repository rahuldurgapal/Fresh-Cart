import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AvailableOrders from './pages/AvailableOrders';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import Layout from './pages/Layout';

function ProtectedRoute({ children }) {
    const { agent, loading } = useAuth();
    
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #16a34a, #052e16)', flexDirection: 'column', gap: '16px'
            }}>
                <div style={{
                    width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite'
                }} />
                <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Verifying session...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }
    
    return agent ? children : <Navigate to="/" replace />;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                    <Route path="/available" element={<ProtectedRoute><Layout><AvailableOrders /></Layout></ProtectedRoute>} />
                    <Route path="/my-orders" element={<ProtectedRoute><Layout><MyOrders /></Layout></ProtectedRoute>} />
                    <Route path="/order/:id" element={<ProtectedRoute><Layout><OrderDetail /></Layout></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
