import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, quickLogin, demoUsers } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (userId) => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(userId);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '80px auto', padding: '20px' }}>
      <div className="card" style={{ border: '2px solid #000' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Cpu size={32} style={{ margin: '0 auto 8px auto', display: 'block' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>MANUFACTURING & TRACEABILITY SYSTEM</h2>
          <p style={{ fontSize: '12px', color: '#666' }}>Academic Management System Login</p>
        </div>

        {error && (
          <div className="info-box" style={{ borderColor: '#dc2626', color: '#dc2626', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input
              type="text"
              required
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid #ccc', marginTop: '20px', paddingTop: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#666' }}>
            Quick 1-Click Role Login (Presentation Mode):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {demoUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                className="btn btn-sm"
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => handleQuick(u.id)}
              >
                <ShieldCheck size={13} />
                <span><strong>{u.role}:</strong> {u.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
