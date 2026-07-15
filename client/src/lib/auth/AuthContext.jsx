import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient, AUTH_STORAGE_KEY } from '../apiClient';

export const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((next) => {
    setAuth(next);
    if (next) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const login = useCallback(
    async (role, credentials) => {
      const data = await apiClient.post(`/auth/login/${role}`, credentials);
      const profile = data.household || data.user;
      persist({ token: data.token, role, profile });
      return profile;
    },
    [persist]
  );

  const refreshProfile = useCallback(async () => {
    const current = readStoredAuth();
    if (!current) {
      setLoading(false);
      return;
    }
    try {
      const data = await apiClient.get('/auth/me');
      persist({ token: current.token, role: data.role, profile: data.profile });
    } catch {
      persist(null);
    } finally {
      setLoading(false);
    }
  }, [persist]);

  useEffect(() => {
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('mosque:unauthorized', handler);
    return () => window.removeEventListener('mosque:unauthorized', handler);
  }, [logout]);

  const value = useMemo(
    () => ({
      token: auth?.token || null,
      role: auth?.role || null,
      profile: auth?.profile || null,
      isAuthenticated: !!auth?.token,
      loading,
      login,
      logout,
      setProfile: (profile) => persist({ ...auth, profile }),
    }),
    [auth, loading, login, logout, persist]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
