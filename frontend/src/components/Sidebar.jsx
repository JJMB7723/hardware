import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Users,
  RotateCcw,
  Truck,
  CheckSquare,
  Boxes,
  Layers,
  Factory,
  SearchCode,
  UserPlus,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    signout();
    navigate('/signin');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Product', icon: Package },
    { to: '/cart', label: 'Cart', icon: ShoppingCart },
    { to: '/orders', label: 'Order', icon: ClipboardList },
    { to: '/employees', label: 'Employee', icon: Users },
    { to: '/returns', label: 'Return & Replacement', icon: RotateCcw },
    { to: '/deliveries', label: 'Delivery', icon: Truck },
    { to: '/inspections', label: 'Inspection', icon: CheckSquare },
    { to: '/stock', label: 'Stock (Inventory)', icon: Boxes },
    { to: '/manufacturing', label: 'Manufacturing', icon: Factory },
    { to: '/assembly', label: 'Assembly', icon: Layers },
    { to: '/traceability', label: 'Traceability', icon: SearchCode },
  ];

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Admin Management Section */}
        {user && user.role === 'ADMIN' && (
          <>
            <div style={{ borderTop: '1px solid #000', margin: '8px 12px', opacity: 0.8 }} />
            <NavLink
              to="/admin-management"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <UserPlus size={16} />
              <span>Create Admin</span>
            </NavLink>
            <a
              href="#logout"
              onClick={handleLogout}
              className="sidebar-link"
              style={{ cursor: 'pointer' }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </a>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div><strong>Administrator Access</strong></div>
        <div style={{ fontSize: '11px', color: '#666' }}>Role-Protected Session</div>
      </div>
    </aside>
  );
}
