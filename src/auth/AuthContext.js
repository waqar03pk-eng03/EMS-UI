import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, setToken, setUnauthorizedHandler } from '../services/api';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // If a token is stored, wait for the server to confirm it before deciding who is logged in.
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    if (!getToken()) return;
    authService
      .getMe()
      .then(setUser)
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const startSession = ({ token, user: u }) => {
    setToken(token);
    setUser(u);
    return u;
  };

  const login = async (email, password) => startSession(await authService.login(email, password));
  const register = async (name, email, password) =>
    startSession(await authService.register(name, email, password));
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = { user, loading, isAdmin: Boolean(user && user.role === 'admin'), login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
