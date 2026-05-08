"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { authApi, userApi, User, ApiError } from "../services/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state from storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setAccessToken(storedToken);
      // Verify token is still valid by calling refresh
      refreshAuthToken(storedToken).catch(() => {
        localStorage.removeItem("accessToken");
        setAccessToken(null);
      });
    }
    setIsLoading(false);
  }, []);

  const refreshAuthToken = useCallback(async (token?: string) => {
    try {
      const result = await authApi.refresh();
      const newToken = result.accessToken;
      setAccessToken(newToken);
      localStorage.setItem("accessToken", newToken);
    } catch (err) {
      throw err;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authApi.login(email, password);
      setAccessToken(result.accessToken);
      setUser(result.user);
      localStorage.setItem("accessToken", result.accessToken);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed";
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const result = await authApi.register(email, password, fullName);
      setAccessToken(result.accessToken);
      setUser(result.user);
      localStorage.setItem("accessToken", result.accessToken);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Registration failed";
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("accessToken");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!accessToken && !!user,
        accessToken,
        login,
        register,
        logout,
        refreshToken: refreshAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
