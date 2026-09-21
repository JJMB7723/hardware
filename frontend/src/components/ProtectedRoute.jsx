import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'monospace' }}>
        <div className="info-box" style={{ maxWidth: '400px', margin: '40px auto' }}>
          Verifying administrator credentials...
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect unauthenticated user directly to /signin
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '20px' }}>
        <div className="card" style={{ border: '2px solid #000', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
            UNAUTHORIZED / ACCESS DENIED
          </h2>
          <p style={{ color: '#555', marginBottom: '16px' }}>
            This application is restricted exclusively to authorized administrators.
          </p>
          <a href="/signin" className="btn btn-primary">
            Sign In with Administrator Account
          </a>
        </div>
      </div>
    );
  }

  return children;
}
