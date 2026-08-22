"use client";

import React from "react";
import Image from "next/image";
import type { ActiveModule } from "@/lib/types";
import {
  LayoutDashboard, BookOpen, Bot, User,
  ChevronRight, Zap, Settings, Sparkles, Shield,
} from "lucide-react";

interface NavItem {
  id: ActiveModule;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard",          description: "Overview & metrics",    icon: LayoutDashboard, color: "#4255FF" },
  { id: "library",   label: "Document Library",   description: "Manage your PDFs",      icon: BookOpen,        color: "#18A558", badge: "Upload" },
  { id: "tutor",     label: "PrinceAI",           description: "RAG-powered Q&A",       icon: Bot,             color: "#00C9DB", badge: "AI" },
  { id: "profile",   label: "Profile & Analytics",description: "Your study insights",   icon: User,            color: "#FF8C42" },
  { id: "admin",     label: "Admin Panel",         description: "System management",     icon: Shield,          color: "#FF8C42" },
];

interface SidebarProps {
  activeModule: ActiveModule;
  onModuleChange: (m: ActiveModule) => void;
}

function NavButton({
  item, isActive, onClick,
}: { item: NavItem; isActive: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      id={`nav-${item.id}`}
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 10px",
        borderRadius: "12px",
        marginBottom: "2px",
        cursor: "pointer",
        border: "none",
        textAlign: "left",
        transition: "all 0.16s ease",
        background: isActive ? "var(--brand-indigo-lt)" : "transparent",
        color: isActive ? "var(--brand-indigo)" : "var(--text-secondary)",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "9px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isActive ? "white" : "var(--bg-elevated)",
          flexShrink: 0,
          boxShadow: isActive ? "0 2px 8px rgba(66,85,255,0.15)" : "none",
          transition: "all 0.16s ease",
        }}
      >
        <Icon size={15} color={isActive ? "var(--brand-indigo)" : item.color} strokeWidth={2} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: isActive ? 700 : 500, color: isActive ? "var(--brand-indigo)" : "var(--text-primary)", lineHeight: 1.3 }}>
          {item.label}
        </div>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.2, marginTop: "1px" }}>
          {item.description}
        </div>
      </div>

      {item.badge && (
        <span className="badge badge-new" style={{ fontSize: "9px", flexShrink: 0 }}>
          {item.badge}
        </span>
      )}
      {isActive && <ChevronRight size={13} color="var(--brand-indigo)" style={{ flexShrink: 0 }} />}
    </button>
  );
}

export default function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <aside
      style={{
        width: "var(--sidebar-w)",
        minWidth: "var(--sidebar-w)",
        height: "100dvh",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* LOGO SLOT: studyraghub-logo.png in /public/ */}
          <Image
            src="/studyraghub-logo.png"
            alt="Study RAG Hub Logo"
            width={44}
            height={44}
            style={{ borderRadius: "10px", objectFit: "contain", flexShrink: 0, width: "44px", height: "44px" }}
            priority
          />
          <div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Study RAG Hub
            </div>
            <span className="badge badge-indigo" style={{ fontSize: "9px", marginTop: "2px", display: "inline-flex" }}>
              <Sparkles size={8} /> AI Platform
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        <div className="section-label" style={{ padding: "6px 8px 8px" }}>Modules</div>
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeModule === item.id}
            onClick={() => onModuleChange(item.id)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "10px 8px 14px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "12px", background: "var(--pastel-purple)", border: "1px solid rgba(66,85,255,0.15)" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(66,85,255,0.12)" }}>
            <Zap size={14} color="var(--brand-indigo)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>RAG Engine Active</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>FastAPI · :8000</div>
          </div>
          <Settings size={13} color="var(--text-muted)" />
        </div>
      </div>
    </aside>
  );
}