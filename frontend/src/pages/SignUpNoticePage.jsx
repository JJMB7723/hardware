import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function SignUpNoticePage() {
  const { user } = useAuth();

  // If already authenticated as ADMIN, direct straight to Admin Creation page
  if (user && user.role === 'ADMIN') {
    return <Navigate to="/admin-management" replace />;
  }

  return (
    <div style={{ maxWidth: '440px', margin: '80px auto', padding: '0 20px' }}>
      <div className="card" style={{ border: '2px solid #000', padding: '24px', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '14px', marginBottom: '20px' }}>
          <ShieldAlert size={30} style={{ margin: '0 auto 6px auto', display: 'block' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            ADMIN ACCESS RESTRICTION
          </h2>
        </div>

        <div className="info-box" style={{ backgroundColor: '#f8f8f8', border: '1px solid #000', marginBottom: '20px', lineHeight: 1.6 }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Only an existing administrator can create a new admin account.
          </p>
          <p style={{ fontSize: '12px', color: '#555' }}>
            There is no public self-registration. To register a new administrator, an existing authenticated administrator must sign in and use the <strong>Create Admin</strong> management tool.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            to="/signin"
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', textAlign: 'center' }}
          >
            GO TO ADMIN SIGN IN
          </Link>
        </div>
      </div>
    </div>
  );
}
