"use client";

import React, { useState, useEffect } from "react";
import {
  Users, FileText, MessageSquare, Cpu, Trash2, RefreshCw,
  Eye, CheckCircle, AlertCircle, Loader2, Shield, Database,
  Activity, Zap, BarChart3, Globe, Clock, ChevronDown, ChevronUp,
  TrendingUp, Server,
} from "lucide-react";

/* ─── Mock Data ─── */
const MOCK_DOCS = [
  { id: "d1", name: "Advanced Algorithms & Data Structures.pdf", uploadedBy: "scholar@studyraghub.ai", subject: "Computer Science", pages: 312, chunks: 894, size: "4.2 MB", status: "indexed", indexedAt: "2 days ago", color: "#4255FF" },
  { id: "d2", name: "Quantum Mechanics — Griffiths 4th Edition.pdf", uploadedBy: "student2@example.com", subject: "Physics", pages: 508, chunks: 1432, size: "8.1 MB", status: "indexed", indexedAt: "5 days ago", color: "#00C9DB" },
  { id: "d3", name: "Molecular Biology of the Cell.pdf", uploadedBy: "bio_student@mit.edu", subject: "Biology", pages: 780, chunks: 2100, size: "12.5 MB", status: "indexed", indexedAt: "1 week ago", color: "#18A558" },
  { id: "d4", name: "Introduction to Machine Learning.pdf", uploadedBy: "ml_researcher@stanford.edu", subject: "ML/AI", pages: 425, chunks: 1120, size: "6.3 MB", status: "indexing", indexedAt: "Just now", color: "#FF8C42" },
  { id: "d5", name: "Organic Chemistry — McMurry.pdf", uploadedBy: "chem_lab@example.com", subject: "Chemistry", pages: 1050, chunks: 2800, size: "18.7 MB", status: "error", indexedAt: "3 days ago", color: "#FF4B4B" },
];

const MOCK_LOGS = [
  { time: "00:03:12", level: "INFO",    msg: "FastAPI health check: OK (12ms)" },
  { time: "00:02:55", level: "INFO",    msg: "ChromaDB vector count: 8,346 embeddings" },
  { time: "00:02:43", level: "INFO",    msg: "Gemini API status: Operational" },
  { time: "00:01:30", level: "SUCCESS", msg: "Document 'd3' re-indexed successfully (2,100 chunks)" },
  { time: "00:00:58", level: "WARNING", msg: "Document 'd5' indexing failed — PDF corruption detected" },
  { time: "00:00:22", level: "INFO",    msg: "New user registered: student3@example.com" },
  { time: "23:58:44", level: "INFO",    msg: "RAG query processed in 340ms — 3 sources returned" },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  indexed:  { label: "Indexed",   color: "#18A558", bg: "var(--pastel-mint)"   },
  indexing: { label: "Indexing…", color: "#D4A000", bg: "var(--pastel-yellow)" },
  error:    { label: "Error",     color: "#FF4B4B", bg: "var(--pastel-rose)"   },
};

const LOG_CFG: Record<string, { color: string; bg: string }> = {
  INFO:    { color: "#4255FF", bg: "var(--pastel-purple)" },
  SUCCESS: { color: "#18A558", bg: "var(--pastel-mint)"   },
  WARNING: { color: "#D4A000", bg: "var(--pastel-yellow)" },
  ERROR:   { color: "#FF4B4B", bg: "var(--pastel-rose)"   },
};

export default function AdminDashboard() {
  const [docs, setDocs] = useState(MOCK_DOCS);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"reindex" | "delete" | null>(null);
  const [healthStatus, setHealthStatus] = useState<"checking" | "online" | "offline">("checking");
  const [geminiStatus, setGeminiStatus] = useState<"checking" | "operational" | "degraded">("checking");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setHealthStatus("online"), 1200);
    const t2 = setTimeout(() => setGeminiStatus("operational"), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleDelete = async (id: string) => {
    setActionId(id); setActionType("delete");
    await new Promise((r) => setTimeout(r, 1000));
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setActionId(null); setActionType(null);
  };

  const handleReindex = async (id: string) => {
    setActionId(id); setActionType("reindex");
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, status: "indexing" } : d));
    await new Promise((r) => setTimeout(r, 2000));
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, status: "indexed", indexedAt: "Just now" } : d));
    setActionId(null); setActionType(null);
  };

  const totalChunks = docs.reduce((a, d) => a + d.chunks, 0);

  return (
    <div style={{ padding: "24px", background: "var(--bg-base)", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Admin header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "linear-gradient(135deg, #FF8C42, #FFCD1F)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(255,140,66,0.3)", flexShrink: 0 }}>
          <Shield size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontFamily: "'Poppins','Inter',sans-serif", fontSize: "clamp(18px,4vw,26px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Admin Control Panel
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>System management · Study RAG Hub Platform</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <span className="badge badge-success"><CheckCircle size={9} /> Platform Live</span>
          <span style={{ padding: "3px 10px", background: "var(--pastel-orange)", border: "1px solid #FFD0A8", borderRadius: "var(--radius-pill)", fontSize: "10px", fontWeight: 700, color: "#FF8C42", display: "inline-flex", alignItems: "center", gap: "3px" }}>
            <Shield size={9} /> Admin Session
          </span>
        </div>
      </div>

      {/* ─── Metric Cards ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))", gap: "12px" }}>
        {[
          { icon: Users,        label: "Active Users",     value: "1,284",              delta: "+12 today",   bg: "var(--pastel-purple)", color: "#4255FF" },
          { icon: FileText,     label: "Documents in DB",  value: docs.length.toString(), delta: `${totalChunks.toLocaleString()} chunks`, bg: "var(--pastel-aqua)",   color: "#007A84" },
          { icon: MessageSquare,label: "Queries Today",    value: "3,741",              delta: "+284 / hour", bg: "var(--pastel-mint)",   color: "#18A558" },
          { icon: TrendingUp,   label: "Avg Response",     value: "340ms",              delta: "Gemini Flash", bg: "var(--pastel-yellow)", color: "#D4A000" },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} style={{ background: m.bg, borderRadius: "var(--radius-xl)", padding: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Icon size={18} color={m.color} />
                <span style={{ fontSize: "9px", fontWeight: 700, color: m.color, background: "#fff", padding: "2px 8px", borderRadius: "var(--radius-pill)", opacity: 0.9 }}>{m.delta}</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{m.value}</div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>{m.label}</div>
            </div>
          );
        })}
      </div>

      {/* ─── System Health ─── */}
      <div className="card" style={{ padding: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <Activity size={15} color="var(--brand-indigo)" />
          <h2 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>System Health</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))", gap: "10px" }}>
          {[
            {
              icon: Server, label: "FastAPI Backend",
              status: healthStatus === "checking" ? "checking" : healthStatus === "online" ? "online" : "offline",
              detail: healthStatus === "checking" ? "Connecting…" : "http://127.0.0.1:8000 · 12ms",
            },
            {
              icon: Database, label: "ChromaDB Vectors",
              status: healthStatus === "checking" ? "checking" : "online",
              detail: healthStatus === "checking" ? "Checking…" : `${totalChunks.toLocaleString()} embeddings stored`,
            },
            {
              icon: Zap, label: "Gemini API",
              status: geminiStatus === "checking" ? "checking" : geminiStatus === "operational" ? "online" : "degraded",
              detail: geminiStatus === "checking" ? "Connecting…" : "gemini-1.5-flash · Operational",
            },
            {
              icon: Globe, label: "Platform Uptime",
              status: "online",
              detail: "99.97% this month · 14d 6h",
            },
          ].map((h) => {
            const Icon = h.icon;
            const isOnline = h.status === "online";
            const isChecking = h.status === "checking";
            const isDegraded = h.status === "degraded";
            return (
              <div key={h.label} style={{ padding: "12px 14px", background: isOnline ? "var(--pastel-mint)" : isDegraded ? "var(--pastel-yellow)" : "var(--bg-elevated)", borderRadius: "12px", border: `1px solid ${isOnline ? "var(--pastel-mint-d)" : isDegraded ? "#FFE9A0" : "var(--border)"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px" }}>
                  <Icon size={13} color={isOnline ? "#18A558" : isDegraded ? "#D4A000" : "var(--text-muted)"} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{h.label}</span>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                    {isChecking ? (
                      <Loader2 size={10} className="animate-spin" color="var(--text-muted)" />
                    ) : (
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: isOnline ? "#18A558" : isDegraded ? "#D4A000" : "#FF4B4B" }} />
                    )}
                    <span style={{ fontSize: "9px", fontWeight: 700, color: isOnline ? "#18A558" : isDegraded ? "#D4A000" : "var(--text-muted)" }}>
                      {isChecking ? "…" : isOnline ? "Online" : isDegraded ? "Degraded" : "Offline"}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>{h.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Document Manager Table ─── */}
      <div className="card" style={{ padding: "18px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <Database size={15} color="var(--brand-indigo)" />
          <h2 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>Global Document Manager</h2>
          <span className="badge badge-indigo" style={{ fontSize: "9px" }}>{docs.length} documents</span>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)" }}>
            {totalChunks.toLocaleString()} total chunks in ChromaDB
          </span>
        </div>

        {/* Scrollable table wrapper */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", margin: "0 -4px", padding: "0 4px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px" }}>
            <thead>
              <tr>
                {["Document", "Subject", "Pages", "Chunks", "Size", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid var(--border)", whiteSpace: "nowrap", background: "#fff" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, i) => {
                const st = STATUS_CFG[doc.status];
                const isActing = actionId === doc.id;
                return (
                  <React.Fragment key={doc.id}>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s ease", cursor: "pointer", background: expanded === doc.id ? "var(--pastel-purple)" : i % 2 === 0 ? "#fff" : "var(--bg-base)" }}
                      onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}>

                      {/* Name */}
                      <td style={{ padding: "12px 10px", maxWidth: "240px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "28px", height: "32px", borderRadius: "6px", background: doc.color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FileText size={14} color={doc.color} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>{doc.name}</p>
                            <p style={{ fontSize: "10px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>{doc.uploadedBy}</p>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <span className="badge badge-indigo" style={{ fontSize: "9px" }}>{doc.subject}</span>
                      </td>
                      <td style={{ padding: "12px 10px", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{doc.pages.toLocaleString()}</td>
                      <td style={{ padding: "12px 10px", fontSize: "12px", fontWeight: 700, color: "var(--brand-indigo)", whiteSpace: "nowrap" }}>{doc.chunks.toLocaleString()}</td>
                      <td style={{ padding: "12px 10px", fontSize: "12px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{doc.size}</td>

                      {/* Status */}
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", background: st.bg, borderRadius: "var(--radius-pill)", fontSize: "9px", fontWeight: 700, color: st.color, whiteSpace: "nowrap" }}>
                          {doc.status === "indexing" && <Loader2 size={8} className="animate-spin" />}
                          {doc.status === "indexed" && <CheckCircle size={8} />}
                          {doc.status === "error" && <AlertCircle size={8} />}
                          {st.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", gap: "5px" }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}
                            title="View chunks"
                            style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1.5px solid var(--border)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}
                          >
                            {expanded === doc.id ? <ChevronUp size={12} /> : <Eye size={12} />}
                          </button>
                          <button
                            onClick={() => handleReindex(doc.id)}
                            disabled={isActing}
                            title="Re-index"
                            style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1.5px solid rgba(66,85,255,0.25)", background: "var(--pastel-purple)", display: "flex", alignItems: "center", justifyContent: "center", cursor: isActing ? "not-allowed" : "pointer", color: "var(--brand-indigo)" }}
                          >
                            {isActing && actionType === "reindex" ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={isActing}
                            title="Delete"
                            style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1.5px solid #FFBDBD", background: "#FFF0F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: isActing ? "not-allowed" : "pointer", color: "var(--error)" }}
                          >
                            {isActing && actionType === "delete" ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expanded === doc.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: "0 10px 14px", background: "var(--pastel-purple)" }}>
                          <div style={{ padding: "12px 14px", background: "#fff", borderRadius: "10px", border: "1px solid rgba(66,85,255,0.15)" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "8px" }}>
                              {[
                                { label: "File Name", value: doc.name },
                                { label: "Uploaded By", value: doc.uploadedBy },
                                { label: "Subject", value: doc.subject },
                                { label: "Pages", value: doc.pages.toLocaleString() },
                                { label: "Vector Chunks", value: doc.chunks.toLocaleString() },
                                { label: "File Size", value: doc.size },
                                { label: "Status", value: st.label },
                                { label: "Last Indexed", value: doc.indexedAt },
                              ].map((info) => (
                                <div key={info.label}>
                                  <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{info.label}</div>
                                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{info.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── System Logs ─── */}
      <div className="card" style={{ padding: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <BarChart3 size={15} color="var(--brand-indigo)" />
          <h2 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>System Health Logs</h2>
          <span style={{ marginLeft: "auto" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#18A558", fontWeight: 700 }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#18A558" }} />
              Live
            </span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontFamily: "'Fira Code','Cascadia Code',monospace" }}>
          {MOCK_LOGS.map((log, i) => {
            const cfg = LOG_CFG[log.level] ?? LOG_CFG.INFO;
            return (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "8px 10px", borderRadius: "9px", background: i === 0 ? "var(--pastel-purple)" : "var(--bg-elevated)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                  <Clock size={10} color="var(--text-muted)" />
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{log.time}</span>
                </div>
                <span style={{ padding: "1px 8px", background: cfg.bg, borderRadius: "var(--radius-pill)", fontSize: "9px", fontWeight: 800, color: cfg.color, whiteSpace: "nowrap", letterSpacing: "0.04em", flexShrink: 0 }}>
                  {log.level}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5, flex: 1 }}>{log.msg}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
