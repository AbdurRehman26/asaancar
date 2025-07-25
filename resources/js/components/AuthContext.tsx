import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiFetch } from '@/lib/utils';
import { type User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: { name: string; email: string; password: string; password_confirmation: string; terms?: boolean }) => Promise<boolean>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, check for token and fetch user
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log('🔍 DEBUG: AuthContext - Stored token:', storedToken ? 'exists' : 'missing');
    if (storedToken) {
      setToken(storedToken);
      apiFetch('/api/user')
        .then(async (res) => {
          if (res.ok) {
            const userData = await res.json();
            // Unwrap .data if present
            setUser(userData.data || userData);
          } else {
            console.log('🔍 DEBUG: AuthContext - User fetch failed, status:', res.status);
            setUser(null);
            localStorage.removeItem('token');
            setToken(null);
          }
        })
        .catch((error) => {
          console.log('🔍 DEBUG: AuthContext - User fetch error:', error);
          setUser(null);
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Login failed');
        setLoading(false);
        return false;
      }
      const data = await res.json();
      console.log('🔍 DEBUG: AuthContext - Login response:', data);
      console.log('🔍 DEBUG: AuthContext - User from login:', data.user);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      // Unwrap .data if present
      setUser(data.user && (data.user.data || data.user));
      setLoading(false);
      return true;
    } catch (e) {
      console.error(e);
      setError('Network error');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    apiFetch('/api/logout', { method: 'POST' });
    // window.location.href = '/'; // Removed forced redirect
  };

  const register = async (data: { name: string; email: string; password: string; password_confirmation: string; terms?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Registration failed');
        setLoading(false);
        return false;
      }
      const resData = await res.json();
      localStorage.setItem('token', resData.token);
      setToken(resData.token);
      // Unwrap .data if present
      setUser(resData.user && (resData.user.data || resData.user));
      setLoading(false);
      return true;
    } catch (e) {
      console.error(e);
      setError('Network error');
      setLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, register, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
} 