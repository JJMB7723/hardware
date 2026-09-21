import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('change_this_password');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { signin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already signed in as admin, redirect to destination or home
  if (user && user.role === 'ADMIN') {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signin(email, password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '0 20px' }}>
      <div className="card" style={{ border: '2px solid #000', padding: '24px', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '14px', marginBottom: '20px' }}>
          <ShieldCheck size={28} style={{ margin: '0 auto 6px auto', display: 'block' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            ADMIN SIGN IN
          </h2>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
            Manufacturing & Traceability System
          </div>
        </div>

        {error && (
          <div
            className="info-box"
            style={{
              borderColor: '#000000',
              backgroundColor: '#f8f8f8',
              color: '#000000',
              fontWeight: '600',
              marginBottom: '16px',
              fontSize: '12px'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={submitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', marginTop: '8px', fontSize: '13px' }}
            disabled={submitting}
          >
            {submitting ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #000', textAlign: 'center' }}>
          <Link
            to="/signup"
            style={{
              color: '#000000',
              fontSize: '12px',
              fontWeight: '600',
              textDecoration: 'underline'
            }}
          >
            Create Admin Account
          </Link>
        </div>
      </div>
    </div>
  );
}
