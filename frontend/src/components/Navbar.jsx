import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, ShieldCheck, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signout();
    navigate('/signin');
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <Cpu size={20} />
        <span>APEX HARDWARE MFG & TRACEABILITY SYSTEM</span>
      </div>

      <div className="header-actions">
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-filled">
              ADMIN
            </span>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>
              {user.name}
            </span>
            <button
              className="btn btn-sm"
              onClick={handleLogout}
              title="Sign Out of Administrator Session"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
