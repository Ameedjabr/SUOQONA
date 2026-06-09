"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { authApi, userApi, User, ApiError } from "../services/api";

function persistUser(user: User | null) {
  if (user) localStorage.setItem("authUser", JSON.stringify(user));
  else localStorage.removeItem("authUser");
}
function loadUser(): User | null {
  try { return JSON.parse(localStorage.getItem("authUser") || "null"); } catch { return null; }
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state from storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = loadUser();

    if (storedToken && storedUser) {
      // Restore immediately from localStorage so ProtectedRoute doesn't flash
      setAccessToken(storedToken);
      setUser(storedUser);
      setIsLoading(false);

      // Then refresh in background to get a fresh token + updated user
      authApi.refresh()
        .then((result) => {
          setAccessToken(result.accessToken);
          localStorage.setItem("accessToken", result.accessToken);
          // Fetch fresh user profile
          return userApi.getProfile(result.accessToken);
        })
        .then((freshUser) => {
          setUser(freshUser);
          persistUser(freshUser);
        })
        .catch(() => {
          // Refresh token expired — clear everything
          setAccessToken(null);
          setUser(null);
          persistUser(null);
          localStorage.removeItem("accessToken");
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshAuthToken = useCallback(async () => {
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
      persistUser(result.user);
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
      persistUser(result.user);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Registration failed";
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updated: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updated };
      persistUser(next);
      return next;
    });
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
      persistUser(null);
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
        updateUser,
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
