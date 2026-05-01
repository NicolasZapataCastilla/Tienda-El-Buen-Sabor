import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, ROLE_ACCESS, ModuleAccess } from '../data/mockData';
import { API_URL } from '../../api.config';

interface AuthContextType {
  user: User | null;
  login: (username: string, password?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  accessibleModules: ModuleAccess[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password?: string) => {
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error de autenticación');
      }
      const userData = await res.json();
      setUser(userData);
    } catch (err: any) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const accessibleModules = user ? ROLE_ACCESS[user.role] : [];

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, accessibleModules }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
