"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<User>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch current user profile on initial mount to persist session
  const refreshUser = async () => {
    try {
      const res = await api.get<User>("/auth/me");
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post<{ user: User; token: string }>("/auth/login", { email, password });
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || "Login failed");
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const res = await api.post<{ user: User; token: string }>("/auth/register", {
      name,
      email,
      password,
    });
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || "Registration failed");
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (name: string): Promise<User> => {
    const res = await api.put<User>("/auth/profile", { name });
    if (res.success && res.data) {
      setUser(res.data);
      return res.data;
    }
    throw new Error(res.message || "Failed to update profile");
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
