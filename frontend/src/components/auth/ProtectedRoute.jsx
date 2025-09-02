import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, adminOnly }) => {
  // This is a placeholder for actual authentication logic
  // In a real application, you would check a global state, context, or token
  const isAuthenticated = localStorage.getItem('userToken'); // Example check
  const userRole = localStorage.getItem('userRole'); // Example check

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;

