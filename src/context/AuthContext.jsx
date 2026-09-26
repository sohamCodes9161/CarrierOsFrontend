import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authApi, setAuthFailureHandler } from '../services/api/index.js';

const AuthContext = createContext(null);

/**
 * status: 'loading' | 'authenticated' | 'unauthenticated' | 'error'
 * 'error' means the server could not be reached while restoring the session.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [bootError, setBootError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [bootAttempt, setBootAttempt] = useState(0);

  // Restore the session (refresh cookie -> access token -> current user).
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    authApi
      .restoreSession()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setBootError(null);
        setStatus('authenticated');
      })
      .catch((err) => {
        if (cancelled) return;
        setUser(null);
        if (err?.code === 'NETWORK' || err?.code === 'TIMEOUT') {
          setBootError(err);
          setStatus('error');
        } else {
          setStatus('unauthenticated');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [bootAttempt]);

  // The API client calls this when a refresh fails mid-session.
  useEffect(() => {
    setAuthFailureHandler(() => {
      setUser(null);
      setSessionExpired(true);
      setStatus('unauthenticated');
    });
    return () => setAuthFailureHandler(null);
  }, []);

  const login = useCallback(async (credentials) => {
    const me = await authApi.login(credentials);
    setUser(me);
    setSessionExpired(false);
    setStatus('authenticated');
    return me;
  }, []);

  const register = useCallback(async (details) => {
    const me = await authApi.register(details);
    setUser(me);
    setSessionExpired(false);
    setStatus('authenticated');
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the request fails, drop the local session.
    } finally {
      setUser(null);
      setSessionExpired(false);
      setStatus('unauthenticated');
    }
  }, []);

  const retry = useCallback(() => setBootAttempt((n) => n + 1), []);

  const value = useMemo(
    () => ({ user, status, bootError, sessionExpired, login, register, logout, retry }),
    [user, status, bootError, sessionExpired, login, register, logout, retry]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
