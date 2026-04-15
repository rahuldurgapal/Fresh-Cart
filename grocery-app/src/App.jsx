import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { WalletProvider } from './context/WalletContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import Wallet from './pages/Wallet';
import SidebarCart from './components/SidebarCart';
import FloatingCart from './components/FloatingCart';
import CrossSellModal from './components/CrossSellModal';
import ScrollToTop from './components/ScrollToTop';
import BottomTabBar from './components/BottomTabBar';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <WalletProvider>
            <CartProvider>
              <WishlistProvider>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Router>
                  <ScrollToTop />
                  <Header />
                  <SidebarCart />
                  <CrossSellModal />
                  <div style={{ flex: 1 }}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                      <Route path="/my-orders" element={<MyOrders />} />
                      <Route path="/order-tracking/:id" element={<OrderTracking />} />
                      <Route path="/wallet" element={<Wallet />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                  </div>
                  <BottomTabBar />
                  <Footer />
                </Router>
              </div>
            </WishlistProvider>
          </CartProvider>
        </WalletProvider>
      </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
