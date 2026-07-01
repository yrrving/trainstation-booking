import { useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authAPI } from '../api/client';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await authAPI.me();
        setUser(response.user);
      } catch {
        // Not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  async function login(username: string, password: string) {
    const response = await authAPI.login(username, password);
    setUser(response.user);
  }

  async function logout() {
    await authAPI.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
