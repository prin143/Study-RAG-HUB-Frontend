"use client";

import React, { useState } from "react";
import type { StudyDocument, Source } from "@/lib/types";
import {
  Bot, BookOpen, Layers, FileText, ArrowRight, Search,
  Upload, Send, Loader2, Star, Flame, Clock,
  BarChart3, Target, TrendingUp, MessageSquare, Zap,
} from "lucide-react";
import { askQuestion } from "@/lib/api";

interface DashboardProps {
  documents: StudyDocument[];
  onModuleChange: (m: string) => void;
  onSourcesUpdate: (s: Source[]) => void;
}

const STUDY_MODES = [
  {
    id: "flashcards",
    title: "Flashcards",
    desc: "Study with interactive flip cards and track what you know.",
    bg: "var(--pastel-aqua)",
    accent: "#007A84",
    iconBg: "#00C9DB",
    icon: Layers,
    badge: null,
    illustration: "🃏",
  },
  {
    id: "tutor",
    title: "AI Study Tutor",
    desc: "Ask questions, get explanations, and generate exam practice.",
    bg: "var(--pastel-purple)",
    accent: "#4255FF",
    iconBg: "#4255FF",
    icon: Bot,
    badge: "New",
    illustration: "🤖",
  },
  {
    id: "library",
    title: "Upload & Index",
    desc: "Upload your PDFs and build your personal knowledge base.",
    bg: "var(--pastel-mint)",
    accent: "#18A558",
    iconBg: "#18A558",
    icon: Upload,
    badge: null,
    illustration: "📚",
  },
  {
    id: "notes",
    title: "Smart Notes",
    desc: "Write markdown notes with AI-powered key takeaways.",
    bg: "var(--pastel-yellow)",
    accent: "#D4A000",
    iconBg: "#FFCD1F",
    icon: FileText,
    badge: null,
    illustration: "📝",
  },
];

const SUBJECT_COVERAGE = [
  { subject: "Algorithms",        coverage: 87, color: "#4255FF" },
  { subject: "Quantum Mechanics", coverage: 62, color: "#00C9DB" },
  { subject: "Molecular Biology", coverage: 45, color: "#18A558" },
  { subject: "Organic Chemistry", coverage: 73, color: "#FF6B8A" },
];

const STUDY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STUDY_HOURS = [2.5, 4, 3, 5.5, 2, 6, 4.5];

export default function Dashboard({ documents, onModuleChange, onSourcesUpdate }: DashboardProps) {
  const [quickQuery, setQuickQuery] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickAnswer, setQuickAnswer] = useState<string | null>(null);

  const maxH = Math.max(...STUDY_HOURS);
  const readyDocs = documents.filter((d) => d.status === "ready");

  const handleQuickAsk = async () => {
    if (!quickQuery.trim() || quickLoading) return;
    setQuickLoading(true);
    setQuickAnswer(null);
    try {
      const res = await askQuestion({ question: quickQuery, study_mode: "general" });
      setQuickAnswer(res.answer.slice(0, 320) + (res.answer.length > 320 ? "…" : ""));
      if (res.sources?.length) onSourcesUpdate(res.sources);
    } catch {
      setQuickAnswer("⚠️ Backend offline — start FastAPI at http://127.0.0.1:8000");
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        background: "var(--bg-base)",
      }}
    >
      {/* ─── Hero Section ─── */}
      <div
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid var(--border)",
          padding: "40px 28px 32px",
          textAlign: "center",
        }}
      >
        {/* Greeting pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 14px",
            background: "var(--brand-indigo-lt)",
            borderRadius: "var(--radius-pill)",
            marginBottom: "16px",
          }}
        >
          <Sparkles size={12} color="var(--brand-indigo)" />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand-indigo)" }}>
            {readyDocs.length} documents indexed & ready
          </span>
        </div>

        {/* Hero heading */}
        <h1
          style={{
            fontFamily: "'Poppins', 'Inter', sans-serif",
            fontSize: "clamp(26px, 5vw, 42px)",
            fontWeight: 900,
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            marginBottom: "12px",
            maxWidth: "560px",
            margin: "0 auto 12px",
          }}
        >
          How do you want to study?
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "var(--text-secondary)",
            marginBottom: "24px",
            maxWidth: "420px",
            margin: "0 auto 24px",
          }}
        >
          Upload your documents and let AI supercharge your revision.
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => onModuleChange("library")}
            className="btn-primary"
            style={{ padding: "12px 28px", fontSize: "15px" }}
          >
            <Upload size={16} /> Upload Document
          </button>
          <button
            onClick={() => onModuleChange("tutor")}
            className="btn-outline"
            style={{ padding: "12px 28px", fontSize: "15px" }}
          >
            <Bot size={16} /> Open AI Tutor
          </button>
        </div>

        {/* Inline stat pills */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }}>
          {[
            { icon: Flame, value: "12", label: "Day Streak",  color: "#FF8C42", bg: "var(--pastel-orange)" },
            { icon: Clock, value: "47h", label: "Study Time",  color: "#4255FF", bg: "var(--pastel-purple)" },
            { icon: Star,  value: "94%", label: "Score Avg",   color: "#18A558", bg: "var(--pastel-mint)" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "7px 14px",
                  background: s.bg,
                  borderRadius: "var(--radius-pill)",
                }}
              >
                <Icon size={14} color={s.color} />
                <strong style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {s.value}
                </strong>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "28px" }}>
        {/* ─── Pastel Study Mode Cards ─── */}
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", letterSpacing: "-0.01em" }}>
          Study modes
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          {STUDY_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                onClick={() => onModuleChange(mode.id)}
                className="pastel-card card-hover"
                style={{ background: mode.bg }}
              >
                {/* Badge */}
                {mode.badge && (
                  <span className="badge badge-black" style={{ position: "absolute", top: "14px", right: "14px", fontSize: "9px" }}>
                    {mode.badge}
                  </span>
                )}

                {/* Illustration emoji */}
                <div style={{ fontSize: "36px", marginBottom: "12px", lineHeight: 1 }}>
                  {mode.illustration}
                </div>

                {/* Icon chip */}
                <div
                  style={{
                    width: "38px", height: "38px",
                    borderRadius: "11px",
                    background: mode.iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                  }}
                >
                  <Icon size={18} color="#fff" />
                </div>

                <h3
                  style={{
                    fontFamily: "'Poppins','Inter',sans-serif",
                    fontSize: "16px", fontWeight: 800,
                    color: "var(--text-primary)",
                    marginBottom: "5px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {mode.title}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "14px" }}>
                  {mode.desc}
                </p>
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: "4px",
                    fontSize: "12px", fontWeight: 700, color: mode.accent,
                  }}
                >
                  Get started <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Quick AI Ask ─── */}
        <div
          className="card"
          style={{ padding: "20px", marginBottom: "20px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <div
              style={{
                width: "34px", height: "34px",
                borderRadius: "10px",
                background: "var(--pastel-purple)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Zap size={16} color="var(--brand-indigo)" />
            </div>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Quick AI Ask</h3>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>RAG-powered · instant answer from your docs</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              id="quick-ask-input"
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickAsk()}
              placeholder="Ask anything from your documents…"
              className="input-field"
              style={{ flex: 1 }}
            />
            <button
              id="quick-ask-btn"
              onClick={handleQuickAsk}
              disabled={!quickQuery.trim() || quickLoading}
              className="btn-primary"
              style={{ padding: "10px 16px", flexShrink: 0 }}
            >
              {quickLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
          {quickAnswer && (
            <div
              className="animate-fade-in"
              style={{
                marginTop: "12px",
                padding: "12px 14px",
                background: "var(--pastel-purple)",
                border: "1px solid rgba(66,85,255,0.15)",
                borderRadius: "12px",
              }}
            >
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.65 }}>{quickAnswer}</p>
              <button
                onClick={() => onModuleChange("tutor")}
                style={{
                  marginTop: "8px",
                  display: "flex", alignItems: "center", gap: "4px",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--brand-indigo)", fontSize: "12px", fontWeight: 700, padding: 0,
                }}
              >
                Open full AI Tutor <ArrowRight size={11} />
              </button>
            </div>
          )}
        </div>

        {/* ─── Analytics Row ─── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: "14px",
          }}
        >
          {/* Weekly chart */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <BarChart3 size={15} color="var(--brand-indigo)" />
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Weekly Activity</h3>
              <span style={{ marginLeft: "auto", fontSize: "13px", fontWeight: 700, color: "var(--brand-indigo)" }}>
                {STUDY_HOURS.reduce((a, h) => a + h, 0).toFixed(1)}h
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px" }}>
              {STUDY_DAYS.map((day, i) => {
                const pct = (STUDY_HOURS[i] / maxH) * 100;
                const isToday = i === 6;
                return (
                  <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${pct}%`,
                        background: isToday ? "var(--brand-indigo)" : "var(--bg-elevated)",
                        borderRadius: "4px 4px 0 0",
                        minHeight: "4px",
                        border: isToday ? "none" : "1px solid var(--border)",
                        transition: "background 0.2s ease",
                      }}
                    />
                    <span style={{ fontSize: "9px", color: isToday ? "var(--brand-indigo)" : "var(--text-muted)", fontWeight: isToday ? 800 : 400 }}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Syllabus Coverage */}
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <Target size={15} color="var(--brand-indigo)" />
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Syllabus Coverage</h3>
            </div>
            {SUBJECT_COVERAGE.map((s) => (
              <div key={s.subject} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>{s.subject}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: s.color }}>{s.coverage}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${s.coverage}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}80)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
