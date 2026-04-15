import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const admin = localStorage.getItem('admin_user');
  if (!admin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
