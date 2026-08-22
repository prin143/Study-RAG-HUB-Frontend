"use client";

import React from "react";
import type { ActiveModule } from "@/lib/types";
import { LayoutDashboard, BookOpen, Bot, User } from "lucide-react";

const TABS: { id: ActiveModule; label: string; icon: React.ElementType; color: string }[] = [
  { id: "dashboard", label: "Home",     icon: LayoutDashboard, color: "#4255FF" },
  { id: "library",   label: "Library",  icon: BookOpen,        color: "#18A558" },
  { id: "tutor",     label: "PrinceAI", icon: Bot,             color: "#00C9DB" },
  { id: "profile",   label: "Profile",  icon: User,            color: "#FF8C42" },
];

interface MobileBottomBarProps {
  activeModule: ActiveModule;
  onModuleChange: (m: ActiveModule) => void;
}

export default function MobileBottomBar({ activeModule, onModuleChange }: MobileBottomBarProps) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden"
      style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        height: "var(--bottombar-h)",
        background: "#FFFFFF",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "stretch",
        zIndex: 30,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeModule === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            id={`mobile-tab-${tab.id}`}
            onClick={() => onModuleChange(tab.id)}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: "3px",
              background: "none", border: "none", cursor: "pointer",
              padding: "6px 4px",
              position: "relative",
            }}
            className="touch-ripple"
          >
            {/* Top indicator bar */}
            {isActive && (
              <div
                style={{
                  position: "absolute", top: 0, left: "50%",
                  transform: "translateX(-50%)",
                  width: "24px", height: "3px",
                  borderRadius: "0 0 3px 3px",
                  background: "var(--brand-indigo)",
                }}
              />
            )}

            {/* Icon container */}
            <div
              style={{
                width: "36px", height: "36px",
                borderRadius: "11px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isActive ? "var(--brand-indigo-lt)" : "transparent",
                transition: "background 0.18s ease",
              }}
            >
              <Icon
                size={20}
                color={isActive ? "var(--brand-indigo)" : "var(--text-muted)"}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </div>

            <span
              style={{
                fontSize: "10px",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--brand-indigo)" : "var(--text-muted)",
                lineHeight: 1,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
