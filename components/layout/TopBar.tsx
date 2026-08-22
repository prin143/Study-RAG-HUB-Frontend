"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Bell, Search, Plus,
  ChevronDown, LogOut, User, Shield, Settings,
} from "lucide-react";

interface TopBarProps {
  onAuthOpen: (tab: "login" | "signup") => void;
  onModuleChange: (m: string) => void;
}

export default function TopBar({ onAuthOpen, onModuleChange }: TopBarProps) {
  const { user, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  return (
    <header
      style={{
        height: "var(--topbar-h)",
        background: "#FFFFFF",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: "12px",
        position: "sticky",
        top: 0,
        zIndex: 20,
        flexShrink: 0,
        boxShadow: "0 1px 0 var(--border)",
      }}
    >
      {/* Search bar — always visible on desktop */}
      <div className="search-bar" style={{ flex: 1, maxWidth: "480px" }}>
        <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <input placeholder="Search topics, subjects, documents…" />
      </div>

      {/* ── Right controls ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "auto" }}>
        {user ? (
          /* ─── Authenticated ─── */
          <>
            {/* + Create */}
            <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}>
              <Plus size={14} /> Create
            </button>

            {/* Bell */}
            <button aria-label="Notifications" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-elevated)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", flexShrink: 0 }} className="touch-ripple">
              <Bell size={15} color="var(--text-secondary)" />
              <div style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: "var(--brand-indigo)", border: "2px solid #fff" }} />
            </button>

            {/* Avatar + dropdown */}
            <div ref={dropRef} style={{ position: "relative" }}>
              <button
                id="user-avatar-btn"
                onClick={() => setDropdownOpen((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "4px",
                  border: "none", background: "none", cursor: "pointer",
                }}
              >
                <div style={{
                  width: "34px", height: "34px", borderRadius: "50%",
                  background: user.role === "admin"
                    ? "linear-gradient(135deg, #FF8C42, #FFCD1F)"
                    : "linear-gradient(135deg, #4255FF, #00C9DB)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 800, color: "#fff",
                  border: "2px solid white",
                  boxShadow: "0 2px 8px rgba(66,85,255,0.25)",
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{user.name}</div>
                  {user.role === "admin" && (
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#FF8C42", background: "var(--pastel-orange)", padding: "1px 6px", borderRadius: "var(--radius-pill)", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                      <Shield size={8} /> ADMIN
                    </span>
                  )}
                </div>
                <ChevronDown size={13} color="var(--text-muted)" />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div
                  className="animate-fade-in"
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    width: "210px",
                    background: "#fff",
                    border: "1.5px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 50,
                    overflow: "hidden",
                  }}
                >
                  {/* User info header */}
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", background: "var(--pastel-purple)" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>{user.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{user.email}</div>
                  </div>

                  <div style={{ padding: "6px" }}>
                    {[
                      { icon: User,     label: "Profile",     action: () => { onModuleChange("profile"); setDropdownOpen(false); } },
                      { icon: Settings, label: "Settings",    action: () => setDropdownOpen(false) },
                      ...(isAdmin ? [{ icon: Shield, label: "Admin Panel", action: () => { onModuleChange("admin"); setDropdownOpen(false); } }] : []),
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={item.action}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", gap: "9px",
                            padding: "9px 10px", borderRadius: "9px",
                            border: "none", background: "transparent", cursor: "pointer",
                            fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)",
                            textAlign: "left", transition: "all 0.14s ease",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <Icon size={14} color={item.label === "Admin Panel" ? "#FF8C42" : "var(--text-muted)"} />
                          {item.label}
                          {item.label === "Admin Panel" && (
                            <span style={{ marginLeft: "auto", fontSize: "9px", background: "var(--pastel-orange)", color: "#FF8C42", padding: "1px 6px", borderRadius: "var(--radius-pill)", fontWeight: 700 }}>NEW</span>
                          )}
                        </button>
                      );
                    })}

                    <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />

                    <button
                      id="logout-btn"
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "9px",
                        padding: "9px 10px", borderRadius: "9px",
                        border: "none", background: "transparent", cursor: "pointer",
                        fontSize: "13px", fontWeight: 600, color: "var(--error)",
                        textAlign: "left", transition: "all 0.14s ease",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FFF0F0"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <LogOut size={14} color="var(--error)" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ─── Guest ─── */
          <>
            <button
              id="login-btn"
              onClick={() => onAuthOpen("login")}
              className="btn-ghost hidden sm:inline-flex"
              style={{ fontSize: "13px", padding: "8px 18px" }}
            >
              Log in
            </button>
            <button
              id="signup-btn"
              onClick={() => onAuthOpen("signup")}
              className="btn-primary"
              style={{ fontSize: "13px", padding: "8px 18px" }}
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </header>
  );
}
