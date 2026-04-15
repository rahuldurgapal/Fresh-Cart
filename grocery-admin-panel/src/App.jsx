import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Coupons from './pages/Coupons';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Marketing from './pages/Marketing';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';
import Staff from './pages/Staff';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<AdminLogin />} />

        {/* All Admin Routes — Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products"   element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="coupons"    element={<Coupons />} />
          <Route path="orders"     element={<Orders />} />
          <Route path="customers"  element={<Customers />} />
          <Route path="staff"      element={<Staff />} />
          <Route path="marketing"  element={<Marketing />} />
          <Route path="reviews"    element={<Reviews />} />
          <Route path="settings"   element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
