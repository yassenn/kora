import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import secureStorage from '../services/secureStorage';
import { login as apiLogin, setAuthTokens, setOnTokenRefresh, verifyOTP as apiVerifyOTP, me as apiMe } from '../services/api';
import { setupNotifications } from '../services/notifications';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Persistence helper
  const persist = async (u, t, rt) => {
    try {
      await secureStorage.setItem('auth', { user: u, token: t, refresh_token: rt });
    } catch (err) {
      console.warn('Failed to persist auth', err);
    }
  };

  // Set up token refresh callback
  useEffect(() => {
    setOnTokenRefresh((newToken, newRefreshToken) => {
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      if (user) {
        persist(user, newToken, newRefreshToken);
      }
    });
  }, [user]);

  useEffect(() => {
    let unsubscribe;
    if (user && token) {
      setupNotifications().then(unsub => {
        unsubscribe = unsub;
      }).catch(err => console.error('Notification setup failed', err));
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, token]);

  useEffect(() => {
    // attempt to restore auth from storage
    let mounted = true;
    const restore = async () => {
      try {
        const stored = await secureStorage.getItem('auth');
        if (!mounted) return;
        
        if (stored && stored.user) {
          const t = stored.token || null;
          const rt = stored.refresh_token || null;

          if (t) {
            // Native platform or legacy web session
            setToken(t);
            setRefreshToken(rt);
            setAuthTokens(t, rt);
            setUser(stored.user);
          } else if (Platform.OS === 'web') {
            // Web platform (VULN-004 fix): rely on HttpOnly cookies
            try {
              const res = await apiMe();
              if (res.success && res.data.user) {
                setUser(res.data.user);
              }
            } catch (meErr) {
              console.log('Session restoration via cookie failed', meErr);
            }
          }
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

  const login = async (email, password) => {
    // call API login helper and store result
    try {
      const res = await apiLogin(email, password);
      
      // Support both raw response (res.id) and structured response (res.success && res.data)
      const userData = res.success ? res.data : (res.id ? res : null);

      if (userData && (userData.id || userData.user?.id)) {
        const userObj = userData.user || userData;
        const t = userData.token || null;
        const rt = userData.refresh_token || null;
        
        // Set tokens first to ensure they're available for subsequent requests
        if (t) {
          setToken(t);
          setRefreshToken(rt);
          setAuthTokens(t, rt);
        }
        
        setUser(userObj); // Now trigger navigation
        await persist(userObj, t, rt);
        return userObj;
      }
      throw new Error(res?.message || 'Invalid email or password');
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') {
        logout();
        throw new Error('Session expired. Please log in again.');
      }
      // Check for verification requirement in the error message
      if (err.message.includes('"needs_verification":true')) {
        try {
          // Extract JSON from error message (HTTP 403: {"success":false,...})
          const jsonStr = err.message.substring(err.message.indexOf('{'));
          const errorData = JSON.parse(jsonStr);
          if (errorData.needs_verification) {
            return { needsVerification: true, userId: errorData.user_id };
          }
        } catch (e) {
          console.error('Failed to parse verification error', e);
        }
      }
      throw err;
    }
  };

  const verify = async (userId, code) => {
    const res = await apiVerifyOTP(userId, code);
    const userData = res.success ? res.data : null;

    if (userData && userData.user && userData.token) {
      const t = userData.token;
      const rt = userData.refresh_token || null;
      setUser(userData.user);
      setToken(t);
      setRefreshToken(rt);
      setAuthTokens(t, rt);
      await persist(userData.user, t, rt);
      return userData.user;
    }
    throw new Error(res?.message || 'Verification failed');
  };

  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
    await persist(updatedUser, token, refreshToken);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setAuthTokens(null, null);
    try {
      await secureStorage.removeItem('auth');
    } catch (err) {
      console.warn('Failed to remove auth', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, verify, setUser, setToken, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
