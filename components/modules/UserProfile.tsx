"use client";

import React from "react";
import { User, Mail, Building, Flame, Clock, Target, BookOpen, Layers, Trophy, TrendingUp, Star, Award, Edit3 } from "lucide-react";

const WEEKLY = [
  { day: "Mon", h: 2.5 }, { day: "Tue", h: 4.0 }, { day: "Wed", h: 3.0 },
  { day: "Thu", h: 5.5 }, { day: "Fri", h: 2.0 }, { day: "Sat", h: 6.0 }, { day: "Sun", h: 4.5 },
];
const ACHIEVEMENTS = [
  { icon: Flame,    label: "12-Day Streak",  color: "#FF8C42", bg: "var(--pastel-orange)" },
  { icon: Trophy,   label: "Power Learner",  color: "#4255FF", bg: "var(--pastel-purple)" },
  { icon: BookOpen, label: "Doc Master",     color: "#007A84", bg: "var(--pastel-aqua)"   },
  { icon: Star,     label: "RAG Pro",        color: "#18A558", bg: "var(--pastel-mint)"   },
  { icon: Award,    label: "Notes Champ",    color: "#FF4B4B", bg: "var(--pastel-rose)"   },
];
const EXAMS = [
  { label: "CS PhD Qualifying", date: "Dec 2025", progress: 62, color: "#4255FF", bg: "var(--pastel-purple)" },
  { label: "GRE Advanced",      date: "Oct 2025", progress: 45, color: "#FF4B4B", bg: "var(--pastel-rose)"   },
  { label: "GATE 2025",         date: "Feb 2025", progress: 78, color: "#18A558", bg: "var(--pastel-mint)"   },
];
const CITATIONS = [
  { page: 47,  snippet: "The partitioning scheme in Quicksort ensures elements less than the pivot are moved to the left subarray…" },
  { page: 183, snippet: "The wave function ψ(x,t) satisfies the time-dependent Schrödinger equation and contains all measurable information…" },
  { page: 312, snippet: "DNA replication is semi-conservative — each daughter strand retains one parental strand as template…" },
];

const maxH = Math.max(...WEEKLY.map((d) => d.h));

export default function UserProfile() {
  return (
    <div style={{ padding: "20px", background: "var(--bg-base)", display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* Profile Card */}
      <div className="card" style={{ padding: "20px 22px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #4255FF, #00C9DB)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{
            width: "62px", height: "62px", borderRadius: "18px",
            background: "linear-gradient(135deg, #4255FF, #00C9DB)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", fontWeight: 900, color: "#fff", flexShrink: 0,
            boxShadow: "0 6px 20px rgba(66,85,255,0.3)",
          }}>S</div>
          <div style={{ flex: 1, minWidth: "140px" }}>
            <h2 style={{ fontFamily: "'Poppins','Inter',sans-serif", fontSize: "20px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "4px" }}>
              Scholar Prime
            </h2>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                <Mail size={11} color="var(--text-muted)" /> scholar@studyraghub.ai
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                <Building size={11} color="var(--text-muted)" /> MIT · EECS
              </span>
            </div>
            <div style={{ display: "flex", gap: "5px", marginTop: "8px", flexWrap: "wrap" }}>
              {["CS PhD", "GRE", "GATE 2025"].map((t) => (
                <span key={t} className="badge badge-indigo" style={{ fontSize: "10px" }}>
                  <Target size={9} /> {t}
                </span>
              ))}
            </div>
          </div>
          <button className="btn-ghost" style={{ fontSize: "12px", padding: "7px 14px", flexShrink: 0 }}>
            <Edit3 size={12} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
        {[
          { icon: Flame,    label: "Streak",     value: "12d", bg: "var(--pastel-orange)", color: "#FF8C42" },
          { icon: Clock,    label: "Study Time",  value: "47h", bg: "var(--pastel-purple)", color: "#4255FF" },
          { icon: BookOpen, label: "Documents",   value: "3",   bg: "var(--pastel-aqua)",   color: "#007A84" },
          { icon: Layers,   label: "Flashcards",  value: "24",  bg: "var(--pastel-mint)",   color: "#18A558" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: s.bg, borderRadius: "var(--radius-xl)", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <Icon size={22} color={s.color} />
              <div>
                <div style={{ fontSize: "26px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px", fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly + Exam Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", gap: "12px" }}>
        {/* Bar Chart */}
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
            <TrendingUp size={14} color="var(--brand-indigo)" />
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>This Week</h3>
            <span style={{ marginLeft: "auto", fontSize: "13px", fontWeight: 800, color: "var(--brand-indigo)" }}>
              {WEEKLY.reduce((a, d) => a + d.h, 0).toFixed(1)}h
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "74px" }}>
            {WEEKLY.map((d, i) => {
              const pct = (d.h / maxH) * 100;
              const isToday = i === 6;
              return (
                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "100%", height: `${pct}%`, background: isToday ? "var(--brand-indigo)" : "var(--bg-elevated)", borderRadius: "4px 4px 0 0", border: isToday ? "none" : "1px solid var(--border)", minHeight: "4px" }} />
                  <span style={{ fontSize: "9px", color: isToday ? "var(--brand-indigo)" : "var(--text-muted)", fontWeight: isToday ? 800 : 400 }}>{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exam Targets */}
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
            <Target size={14} color="var(--brand-indigo)" />
            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Exam Targets</h3>
          </div>
          {EXAMS.map((ex) => (
            <div key={ex.label} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{ex.label}</span>
                <span style={{ fontSize: "12px", fontWeight: 800, color: ex.color }}>{ex.progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${ex.progress}%`, background: `linear-gradient(90deg, ${ex.color}, ${ex.color}80)` }} />
              </div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>Target: {ex.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="card" style={{ padding: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
          <Trophy size={14} color="var(--brand-indigo)" />
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Achievements</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100px, 100%), 1fr))", gap: "9px" }}>
          {ACHIEVEMENTS.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", padding: "14px 8px", background: a.bg, borderRadius: "var(--radius-xl)", cursor: "pointer", transition: "transform 0.15s ease" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                  <Icon size={20} color={a.color} />
                </div>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-primary)", textAlign: "center", lineHeight: 1.25 }}>{a.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saved Citations */}
      <div className="card" style={{ padding: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
          <BookOpen size={14} color="var(--brand-indigo)" />
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Saved Citations</h3>
          <span className="badge badge-indigo" style={{ marginLeft: "auto", fontSize: "9px" }}>{CITATIONS.length}</span>
        </div>
        {CITATIONS.map((c, i) => (
          <div key={i} style={{ padding: "12px 14px", background: "var(--pastel-aqua)", borderRadius: "12px", borderLeft: "3px solid var(--accent-aqua)", marginBottom: "8px" }}>
            <span className="citation-chip" style={{ marginBottom: "7px", display: "inline-flex" }}>📄 Page {c.page}</span>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65, fontStyle: "italic" }}>"{c.snippet}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}
