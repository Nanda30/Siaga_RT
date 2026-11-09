import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/endpoints';
import { setApiToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (name, phone) => {
    setIsLoading(true);
    try {
      const result = await authApi.login(name, phone);
      setUser(result.user);
      setToken(result.token);
      setApiToken(result.token);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setApiToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
