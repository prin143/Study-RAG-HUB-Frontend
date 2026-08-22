"use client";

import React, { useState, useRef } from "react";
import type { StudyNote } from "@/lib/types";
import { generateId } from "@/lib/utils";
import {
  Plus, Save, Sparkles, Loader2, FileText, Tag, Clock,
  Bold, Italic, Code, List, Hash, Trash2, Eye, Edit,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { askQuestion } from "@/lib/api";

const DEMO_NOTES: StudyNote[] = [
  {
    id: "n1",
    title: "Quicksort Algorithm Notes",
    content: "## Quicksort Overview\n\nQuicksort is a **divide and conquer** sorting algorithm.\n\n### Key Properties\n- Average case: **O(n log n)**\n- Worst case: **O(n²)** — occurs when pivot is always min/max\n- In-place sorting (no extra memory needed)\n\n### Python Snippet\n```python\ndef quicksort(arr, low, high):\n    if low < high:\n        pi = partition(arr, low, high)\n        quicksort(arr, low, pi - 1)\n        quicksort(arr, pi + 1, high)\n```",
    aiSummary: "Quicksort: O(n log n) avg, O(n²) worst. Divide-and-conquer via pivot. In-place, not stable.",
    createdAt: new Date(Date.now() - 86_400_000),
    updatedAt: new Date(Date.now() - 3_600_000),
    tags: ["algorithms", "sorting"],
  },
  {
    id: "n2",
    title: "Schrödinger Equation Notes",
    content: "## Time-Independent Schrödinger Equation\n\n**Ĥψ = Eψ**\n\n- **Ĥ** = Hamiltonian operator\n- **ψ** = Wave function\n- **E** = Energy eigenvalue\n\nThis describes stationary states of a quantum system.",
    createdAt: new Date(Date.now() - 86_400_000 * 3),
    updatedAt: new Date(Date.now() - 86_400_000),
    tags: ["quantum", "physics"],
  },
];

export default function NotesStudio() {
  const [notes, setNotes] = useState<StudyNote[]>(DEMO_NOTES);
  const [activeId, setActiveId] = useState<string>("n1");
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAI, setIsAI] = useState(false);
  const [showNotesList, setShowNotesList] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeNote = notes.find((n) => n.id === activeId);

  const updateNote = (updates: Partial<StudyNote>) =>
    setNotes((prev) => prev.map((n) => n.id === activeId ? { ...n, ...updates, updatedAt: new Date() } : n));

  const createNote = () => {
    const n: StudyNote = { id: generateId(), title: "Untitled Note", content: "## New Note\n\nStart writing...", createdAt: new Date(), updatedAt: new Date(), tags: [] };
    setNotes((p) => [n, ...p]); setActiveId(n.id); setIsPreview(false); setShowNotesList(false);
  };

  const deleteNote = (id: string) => {
    const rest = notes.filter((n) => n.id !== id);
    setNotes(rest);
    if (activeId === id && rest.length) setActiveId(rest[0].id);
  };

  const save = async () => { setIsSaving(true); await new Promise((r) => setTimeout(r, 600)); setIsSaving(false); };

  const generateSummary = async () => {
    if (!activeNote?.content) return;
    setIsAI(true);
    try {
      const res = await askQuestion({ question: `Summarize in 2-3 bullet points:\n\n${activeNote.content}`, study_mode: "summary" });
      updateNote({ aiSummary: res.answer });
    } catch { updateNote({ aiSummary: `⚠️ Backend offline — start FastAPI at ${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}` }); }
    finally { setIsAI(false); }
  };

  const insertMD = (syntax: string) => {
    const ta = textareaRef.current;
    if (!ta || !activeNote) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = activeNote.content.substring(s, e);
    const newContent = activeNote.content.substring(0, s) + syntax.replace("$1", sel || "text") + activeNote.content.substring(e);
    updateNote({ content: newContent });
  };

  const TOOLBAR = [
    { icon: Bold, syntax: "**$1**" }, { icon: Italic, syntax: "_$1_" },
    { icon: Code, syntax: "`$1`" },   { icon: Hash,   syntax: "## $1"  },
    { icon: List, syntax: "- $1"  },
  ];

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", position: "relative", background: "var(--bg-base)" }}>

      {/* ─── Notes List Sidebar ─── */}
      <div
        className={showNotesList ? "flex" : "hidden md:flex"}
        style={{
          flexDirection: "column",
          width: "220px", minWidth: "220px",
          borderRight: "1px solid var(--border)",
          background: "#FFFFFF",
          height: "100%",
          position: showNotesList ? "absolute" : "relative",
          zIndex: showNotesList ? 10 : 0,
          left: 0, top: 0, bottom: 0,
          boxShadow: showNotesList ? "var(--shadow-lg)" : "none",
        }}
      >
        {/* List header */}
        <div style={{ padding: "14px 12px 10px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>My Notes</span>
          <button
            onClick={createNote}
            style={{ width: "26px", height: "26px", borderRadius: "8px", background: "var(--pastel-purple)", border: "1px solid rgba(66,85,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <Plus size={13} color="var(--brand-indigo)" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => { setActiveId(note.id); setShowNotesList(false); }}
              style={{
                padding: "10px 11px", borderRadius: "10px", cursor: "pointer", marginBottom: "3px",
                background: activeId === note.id ? "var(--pastel-purple)" : "transparent",
                border: `1.5px solid ${activeId === note.id ? "rgba(66,85,255,0.2)" : "transparent"}`,
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "4px" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: activeId === note.id ? "var(--brand-indigo)" : "var(--text-primary)", lineHeight: 1.3, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {note.title}
                </p>
                <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, flexShrink: 0 }}>
                  <Trash2 size={10} />
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "3px" }}>
                <Clock size={9} color="var(--text-muted)" />
                <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{note.updatedAt.toLocaleDateString()}</span>
              </div>
              {note.tags.length > 0 && (
                <div style={{ display: "flex", gap: "3px", marginTop: "4px", flexWrap: "wrap" }}>
                  {note.tags.slice(0, 2).map((t) => (
                    <span key={t} style={{ fontSize: "8px", padding: "1px 6px", background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-pill)", color: "var(--text-muted)" }}>#{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile overlay backdrop */}
      {showNotesList && (
        <div className="md:hidden" onClick={() => setShowNotesList(false)} style={{ position: "absolute", inset: 0, background: "rgba(26,29,40,0.3)", zIndex: 9, backdropFilter: "blur(3px)" }} />
      )}

      {/* ─── Editor Area ─── */}
      {activeNote ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* Editor Header */}
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "#fff", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
            <button
              className="md:hidden"
              onClick={() => setShowNotesList(true)}
              style={{ width: "30px", height: "30px", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", flexShrink: 0 }}
            >
              <FileText size={13} />
            </button>
            <input
              value={activeNote.title}
              onChange={(e) => updateNote({ title: e.target.value })}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "15px", fontWeight: 800, fontFamily: "inherit", minWidth: "60px", letterSpacing: "-0.01em" }}
              placeholder="Note title…"
            />
            <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
              <button onClick={() => setIsPreview((p) => !p)} className="btn-ghost" style={{ fontSize: "11px", padding: "5px 12px" }}>
                {isPreview ? <Edit size={12} /> : <Eye size={12} />}
                <span className="hidden sm:inline">{isPreview ? "Edit" : "Preview"}</span>
              </button>
              <button onClick={save} disabled={isSaving} className="btn-primary" style={{ fontSize: "11px", padding: "5px 14px" }}>
                {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>

          {/* Formatting toolbar */}
          {!isPreview && (
            <div style={{ padding: "6px 16px", borderBottom: "1px solid var(--border)", background: "#fff", display: "flex", alignItems: "center", gap: "3px", flexShrink: 0, overflowX: "auto" }}>
              {TOOLBAR.map((t, i) => {
                const Icon = t.icon;
                return (
                  <button key={i} onClick={() => insertMD(t.syntax)} style={{ width: "30px", height: "30px", borderRadius: "7px", background: "transparent", border: "1.5px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", flexShrink: 0, transition: "all 0.15s ease" }}>
                    <Icon size={13} />
                  </button>
                );
              })}
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Tag size={10} color="var(--text-muted)" />
                {activeNote.tags.map((tag) => (
                  <span key={tag} className="badge badge-indigo" style={{ fontSize: "9px" }}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Editor / Preview */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: isPreview ? "#fff" : "var(--bg-base)" }}>
            {isPreview ? (
              <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }} className="prose-light">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeNote.content}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                id="notes-editor"
                value={activeNote.content}
                onChange={(e) => updateNote({ content: e.target.value })}
                style={{
                  flex: 1, background: "#FAFBFF",
                  border: "none", outline: "none",
                  color: "var(--text-primary)", fontFamily: "'Fira Code','Cascadia Code',monospace",
                  fontSize: "13px", lineHeight: "1.85",
                  padding: "24px 28px", resize: "none", width: "100%", height: "100%",
                }}
                placeholder="Write study notes in Markdown…"
                spellCheck={false}
              />
            )}

            {/* AI Summary */}
            <div style={{ borderTop: "1px solid var(--border)", padding: "14px 18px", background: "#fff", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "var(--pastel-purple)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles size={12} color="var(--brand-indigo)" />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand-indigo)" }}>AI Key Takeaways</span>
                </div>
                <button onClick={generateSummary} disabled={isAI} className="btn-primary" style={{ fontSize: "10px", padding: "4px 12px" }}>
                  {isAI ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                  Generate
                </button>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.7, background: "var(--pastel-purple)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(66,85,255,0.1)" }}>
                {activeNote.aiSummary ?? "Click Generate for AI-powered key takeaways from your notes."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
          <div style={{ textAlign: "center" }}>
            <FileText size={44} color="var(--text-muted)" style={{ marginBottom: "12px", opacity: 0.35 }} />
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>Select or create a note</p>
            <button onClick={createNote} className="btn-primary"><Plus size={14} /> New Note</button>
          </div>
        </div>
      )}
    </div>
  );
}
