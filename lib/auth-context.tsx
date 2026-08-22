"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type UserRole = "student" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  provider: "email" | "google" | "github";
  joinedAt: Date;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Admin credentials come from .env.local ───────────────
// NEXT_PUBLIC_ADMIN_USERNAME=admin
// NEXT_PUBLIC_ADMIN_PASSWORD=prince123
const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "prince123";

const STORAGE_KEY = "princeai_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // isLoading starts false — only true during active login/signup ops.
  // Session restore is synchronous enough (localStorage) to not need a spinner.
  const [isLoading, setIsLoading] = useState(false);

  /* Restore persisted session on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.joinedAt = new Date(parsed.joinedAt);
        setUser(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  const persist = (u: AuthUser | null) => {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700)); // simulate network

    // ── Admin check ──────────────────────────────────────────
    if (
      email.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      const adminUser: AuthUser = {
        id: "u_admin",
        name: "Admin",
        email: ADMIN_USERNAME,
        role: "admin",
        provider: "email",
        joinedAt: new Date("2024-01-01"),
      };
      persist(adminUser);
      setIsLoading(false);
      return;
    }

    // ── Normal user login (any registered email) ─────────────
    // In production replace with a real API call.
    // For now: any non-admin email+password (min 6 chars) logs in.
    if (!email.includes("@")) {
      setIsLoading(false);
      throw new Error("Please enter a valid email address.");
    }
    if (password.length < 6) {
      setIsLoading(false);
      throw new Error("Password must be at least 6 characters.");
    }
    const normalUser: AuthUser = {
      id: `u_${email.replace(/\W/g, "_")}`,
      name: email.split("@")[0],
      email: email.trim().toLowerCase(),
      role: "student",
      provider: "email",
      joinedAt: new Date(),
    };
    persist(normalUser);
    setIsLoading(false);
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    // Admin cannot sign up — they use fixed credentials
    if (email.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
      setIsLoading(false);
      throw new Error("This username is reserved. Please use a different email.");
    }
    const newUser: AuthUser = {
      id: `u_${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      role: "student",
      provider: "email",
      joinedAt: new Date(),
    };
    persist(newUser);
    setIsLoading(false);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const googleUser: AuthUser = {
      id: "u_google",
      name: "Google User",
      email: "google@gmail.com",
      role: "student",
      provider: "google",
      joinedAt: new Date(),
    };
    persist(googleUser);
    setIsLoading(false);
  }, []);

  const loginWithGitHub = useCallback(async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const ghUser: AuthUser = {
      id: "u_github",
      name: "GitHub User",
      email: "github@users.noreply.github.com",
      role: "student",
      provider: "github",
      joinedAt: new Date(),
    };
    persist(ghUser);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    persist(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        loginWithGitHub,
        logout,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
