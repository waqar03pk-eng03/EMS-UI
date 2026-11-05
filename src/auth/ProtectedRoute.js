import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// <ProtectedRoute>        needs any logged-in user
// <ProtectedRoute admin>  needs an admin
export default function ProtectedRoute({ admin, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && user.role !== 'admin') {
    return (
      <div className="ems-empty">
        <h2>Administrators only</h2>
        <p>Your account doesn’t have access to this page.</p>
      </div>
    );
  }
  return children;
}
