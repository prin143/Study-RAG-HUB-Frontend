"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  X, Mail, Lock, User, Eye, EyeOff, Loader2,
  AlertCircle, CheckCircle, ArrowRight, Sparkles,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

/* ─── Social Button ─── */
function SocialBtn({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "9px",
        padding: "11px 16px",
        background: "#fff",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius-md)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "14px", fontWeight: 600,
        color: "var(--text-primary)",
        transition: "all 0.18s ease",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
    >
      {icon}
      {label}
    </button>
  );
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const { login, signup, loginWithGoogle, loginWithGitHub, isLoading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const reset = () => { setError(null); setSuccess(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!email.trim()) { setError("Email is required."); return; }
    if (!password.trim() || password.length < 6) { setError("Password must be at least 6 characters."); return; }
    try {
      if (tab === "login") {
        await login(email, password);
        setSuccess("Welcome back! Redirecting…");
        setTimeout(onClose, 800);
      } else {
        if (!name.trim()) { setError("Name is required."); return; }
        await signup(name, email, password);
        setSuccess("Account created! Welcome to PrinceAI 🎉");
        setTimeout(onClose, 900);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    }
  };

  const handleSocial = async (provider: "google" | "github") => {
    reset();
    try {
      if (provider === "google") await loginWithGoogle();
      else await loginWithGitHub();
      setTimeout(onClose, 400);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Social login failed.");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(26,29,40,0.45)",
          backdropFilter: "blur(6px)",
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 101,
          width: "min(440px, 94vw)",
          background: "#fff",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "0 24px 80px rgba(66,85,255,0.18), 0 8px 32px rgba(0,0,0,0.12)",
          animation: "pop-in 0.28s cubic-bezier(0.34,1.56,0.64,1)",
          overflow: "hidden",
        }}
      >
        {/* Top gradient strip */}
        <div style={{ height: "4px", background: "linear-gradient(90deg, #4255FF, #00C9DB)" }} />

        {/* Header */}
        <div style={{ padding: "22px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg, #4255FF, #00C9DB)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(66,85,255,0.3)" }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                PrinceAI
              </h2>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>AI-powered academic platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: "16px 24px 0", display: "flex", gap: "0", background: "#fff" }}>
          <div style={{ display: "flex", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "4px", gap: "3px", width: "100%" }}>
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); reset(); }}
                style={{
                  flex: 1, padding: "8px", borderRadius: "9px",
                  border: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: 700,
                  background: tab === t ? "#fff" : "transparent",
                  color: tab === t ? "var(--brand-indigo)" : "var(--text-muted)",
                  boxShadow: tab === t ? "var(--shadow-xs)" : "none",
                  transition: "all 0.18s ease",
                }}
              >
                {t === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          {/* Admin hint */}
          <div style={{ padding: "9px 12px", background: "var(--pastel-purple)", borderRadius: "10px", marginBottom: "14px", fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--brand-indigo)" }}>Admin login:</strong>{" "}
            Use your admin username &amp; password. Normal users can{" "}
            <strong>Sign up</strong> with any email.
          </div>

          {/* Social Logins */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
            <SocialBtn
              disabled={isLoading}
              onClick={() => handleSocial("google")}
              label="Continue with Google"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              }
            />
            <SocialBtn
              disabled={isLoading}
              onClick={() => handleSocial("github")}
              label="Continue with GitHub"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              }
            />
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>or continue with email</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {tab === "signup" && (
              <div style={{ position: "relative" }}>
                <User size={15} color="var(--text-muted)" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="input-field"
                  style={{ paddingLeft: "38px" }}
                  autoComplete="name"
                />
              </div>
            )}

            <div style={{ position: "relative" }}>
              <Mail size={15} color="var(--text-muted)" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                id="auth-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tab === "login" ? "Email or admin username" : "Email address"}
                className="input-field"
                style={{ paddingLeft: "38px" }}
                autoComplete="email"
              />
            </div>

            <div style={{ position: "relative" }}>
              <Lock size={15} color="var(--text-muted)" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                id="auth-password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "signup" ? "Create a password (min. 6 chars)" : "Password"}
                className="input-field"
                style={{ paddingLeft: "38px", paddingRight: "42px" }}
                autoComplete={tab === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center" }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Error / Success */}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 12px", background: "#FFF0F0", border: "1px solid #FFBDBD", borderRadius: "10px" }}>
                <AlertCircle size={13} color="var(--error)" />
                <span style={{ fontSize: "12px", color: "var(--error)" }}>{error}</span>
              </div>
            )}
            {success && (
              <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 12px", background: "var(--pastel-mint)", border: "1px solid var(--pastel-mint-d)", borderRadius: "10px" }}>
                <CheckCircle size={13} color="var(--success)" />
                <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>{success}</span>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ justifyContent: "center", padding: "12px", fontSize: "15px", borderRadius: "var(--radius-md)", marginTop: "2px" }}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : tab === "login" ? "Log in" : "Create account"}
              {!isLoading && <ArrowRight size={15} />}
            </button>
          </form>

          {/* Switch tab */}
          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "14px" }}>
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setTab(tab === "login" ? "signup" : "login"); reset(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-indigo)", fontWeight: 700, fontSize: "13px" }}>
              {tab === "login" ? "Sign up free" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
