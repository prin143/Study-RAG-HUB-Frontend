"use client";

import React from "react";
import type { Source } from "@/lib/types";
import { BookOpen, Quote, FileSearch, ChevronRight, Pin, X } from "lucide-react";

interface InspectorPanelProps {
  sources: Source[];
  isSheet: boolean;
  isOpen: boolean;
  onClose: () => void;
}

function SourceCard({ src, i }: { src: Source; i: number }) {
  const relevance = Math.max(60, 95 - i * 12);
  return (
    <div
      className="animate-fade-in-up"
      style={{
        padding: "12px 14px",
        background: i === 0 ? "var(--pastel-purple)" : "#fff",
        border: "1.5px solid var(--border)",
        borderRadius: "12px",
        marginBottom: "8px",
        transition: "box-shadow 0.18s ease",
        cursor: "pointer",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <span className="citation-chip">📄 Page {src.page}</span>
        <div style={{ display: "flex", gap: "4px" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px" }} title="Pin"><Pin size={11} /></button>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px" }} title="Open"><ChevronRight size={11} /></button>
        </div>
      </div>

      <div style={{ borderLeft: "2px solid rgba(66,85,255,0.3)", paddingLeft: "10px" }}>
        <Quote size={10} color="var(--text-muted)" style={{ marginBottom: "3px" }} />
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.65, fontStyle: "italic" }}>
          {src.snippet}
        </p>
      </div>

      <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 600 }}>Relevance</span>
        <div className="progress-bar" style={{ flex: 1, height: "4px" }}>
          <div className="progress-bar-fill" style={{ width: `${relevance}%` }} />
        </div>
        <span style={{ fontSize: "10px", color: "var(--brand-indigo)", fontWeight: 800 }}>{relevance}%</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "28px 16px", textAlign: "center" }}>
      <div
        className="animate-float"
        style={{
          width: "56px", height: "56px", borderRadius: "16px",
          background: "var(--pastel-purple)",
          border: "2px dashed rgba(66,85,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "14px",
        }}
      >
        <BookOpen size={24} color="var(--brand-indigo)" style={{ opacity: 0.5 }} />
      </div>
      <p style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>No sources yet</p>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "5px", lineHeight: 1.55, maxWidth: "200px" }}>
        Ask the AI Tutor and tap a{" "}
        <strong style={{ color: "var(--brand-indigo)" }}>Page X</strong> chip to view evidence here.
      </p>
    </div>
  );
}

export default function InspectorPanel({ sources, isSheet, isOpen, onClose }: InspectorPanelProps) {
  if (!isOpen) return null;

  const header = (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "7px", flexShrink: 0, background: "#fff" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--pastel-purple)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FileSearch size={14} color="var(--brand-indigo)" />
      </div>
      <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>Evidence Inspector</span>
      {sources.length > 0 && (
        <span className="badge badge-indigo" style={{ fontSize: "9px", marginLeft: "4px" }}>
          {sources.length} sources
        </span>
      )}
      {isSheet && (
        <button onClick={onClose} style={{ marginLeft: "auto", width: "28px", height: "28px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
          <X size={14} />
        </button>
      )}
    </div>
  );

  const body = (
    <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "10px 12px" }}>
      {sources.length === 0 ? <EmptyState /> : sources.map((src, i) => <SourceCard key={i} src={src} i={i} />)}
    </div>
  );

  const footer = (
    <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border)", flexShrink: 0, background: "#fff" }}>
      <p style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center" }}>
        Tap citation chips in chat to update sources
      </p>
    </div>
  );

  /* Mobile Bottom Sheet */
  if (isSheet) {
    return (
      <>
        <div className="bottom-sheet-overlay" onClick={onClose} />
        <div className="bottom-sheet">
          <div style={{ display: "flex", justifyContent: "center", cursor: "grab", paddingTop: "8px" }} onClick={onClose}>
            <div className="bottom-sheet-handle" />
          </div>
          {header}{body}{footer}
        </div>
      </>
    );
  }

  /* Desktop Right Panel */
  return (
    <div style={{
      width: "var(--inspector-w)", minWidth: "var(--inspector-w)",
      borderLeft: "1px solid var(--border)",
      background: "var(--bg-base)",
      display: "flex", flexDirection: "column",
      alignSelf: "stretch",   /* fills the flex-row's cross axis (height) reliably */
      flexShrink: 0,
    }}>
      {header}{body}{footer}
    </div>
  );
}
