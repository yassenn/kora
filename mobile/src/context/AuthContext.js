import React, { createContext, useContext, useEffect, useState } from 'react';
import secureStorage from '../services/secureStorage';
import { login as apiLogin, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // attempt to restore auth from storage
    let mounted = true;
    const restore = async () => {
      try {
        const stored = await secureStorage.getItem('auth');
        if (!mounted) return;
          if (stored && stored.user) {
            setUser(stored.user);
            setToken(stored.token || null);
            if (stored.token) setAuthToken(stored.token);
        }
      } catch (err) {
        console.warn('Auth restore failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    restore();
    return () => { mounted = false; };
  }, []);

  const persist = async (u, t) => {
    try {
      await secureStorage.setItem('auth', { user: u, token: t });
    } catch (err) {
      console.warn('Failed to persist auth', err);
    }
  };

  const login = async (email, password) => {
    // call API login helper and store result
    const res = await apiLogin(email, password);
    if (res && res.id) {
      setUser(res);
      // backend currently returns user object; if it returned a token include it
      const t = res.token || null;
      setToken(t);
      if (t) setAuthToken(t);
      await persist(res, t);
      return res;
    }
    throw new Error(res?.message || 'Login failed');
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    try {
      await secureStorage.removeItem('auth');
    } catch (err) {
      console.warn('Failed to remove auth', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
