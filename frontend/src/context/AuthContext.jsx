import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        const res = await api.get('/auth/me');
        if (res && res.user && res.user.role === 'ADMIN') {
          setUser(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        } else {
          signout();
        }
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        signout();
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const signin = async (email, password) => {
    const res = await api.post('/auth/signin', { email, password });
    if (res.success && res.token && res.user) {
      if (res.user.role !== 'ADMIN') {
        throw new Error('Access denied. Administrator privileges required.');
      }
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Invalid email or password');
  };

  const createAdmin = async (adminData) => {
    const res = await api.post('/auth/signup', adminData);
    return res;
  };

  const signout = () => {
    try {
      api.post('/auth/signout').catch(() => {});
    } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, createAdmin, signout, checkCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
