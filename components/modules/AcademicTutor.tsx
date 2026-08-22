"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot, User, FileText, Send, Loader2, AlertCircle,
  FlaskConical, ScrollText, MessageSquare, Copy, Check,
  Lightbulb, ListChecks, BookMarked, Zap, ExternalLink, RefreshCw,
} from "lucide-react";
import type { ChatMessage, StudyMode, Source, StudyDocument } from "@/lib/types";
import { askQuestion } from "@/lib/api";
import { generateId } from "@/lib/utils";

/**
 * AI_AVATAR_URL — PrinceAI chat avatar image.
 * File: public/prince-avatar.png
 * Change this path if you rename/move the image.
 */
export const AI_AVATAR_URL = "/prince-avatar.png";

interface AcademicTutorProps {
  documents: StudyDocument[];
  onSourcesUpdate: (sources: Source[]) => void;
  onOpenInspector: () => void;
}

const PERSONAS: { id: StudyMode; label: string; icon: React.ElementType; bg: string; color: string }[] = [
  { id: "general",   label: "Q&A",       icon: MessageSquare, bg: "var(--pastel-purple)", color: "#4255FF" },
  { id: "exam_prep", label: "Exam Prep", icon: FlaskConical,  bg: "var(--pastel-rose)",   color: "#FF4B4B" },
  { id: "summary",   label: "Summarize", icon: ScrollText,    bg: "var(--pastel-aqua)",   color: "#007A84" },
];

const QUICK_ACTIONS = [
  { icon: Lightbulb,  label: "Explain concept",  prompt: "Explain the core concept of this document in simple terms." },
  { icon: ListChecks, label: "5 MCQ Questions",   prompt: "Generate 5 multiple choice exam questions with answers." },
  { icon: BookMarked, label: "Key Takeaways",     prompt: "Summarize the most important key takeaways." },
  { icon: Zap,        label: "Critical formulas", prompt: "List all critical formulas, equations and definitions." },
];

export default function AcademicTutor({ documents, onSourcesUpdate, onOpenInspector }: AcademicTutorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 **Welcome to PrinceAI!**\n\nI'm powered by **Retrieval-Augmented Generation** — my answers are grounded in your uploaded documents with exact page citations.\n\n**To get started:**\n1. Upload study PDFs in the Library\n2. Pick a study mode above\n3. Ask me anything or tap a quick action below!\n\nTap any **Page X** chip to see the exact source passage.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [studyMode, setStudyMode] = useState<StudyMode>("general");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Probe backend health on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/health`, { signal: AbortSignal.timeout(3000) })
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  const handleSend = useCallback(async (questionOverride?: string) => {
    const question = (questionOverride ?? input).trim();
    if (!question || isLoading) return;
    setInput("");
    setError(null);

    const userMsg: ChatMessage = { id: generateId(), role: "user", content: question, timestamp: new Date() };
    const loadingMsg: ChatMessage = { id: generateId(), role: "assistant", content: "", timestamp: new Date(), isLoading: true };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    try {
      const res = await askQuestion({ question, study_mode: studyMode });
      setMessages((prev) =>
        prev.map((m) =>
          m.isLoading
            ? { ...m, content: res.answer, sources: res.sources, studyMode, isLoading: false }
            : m
        )
      );
      if (res.sources?.length) onSourcesUpdate(res.sources);
      setBackendOnline(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) =>
        prev.map((m) =>
          m.isLoading
            ? { ...m, content: `❌ **Backend Error**\n\n${msg}\n\nEnsure FastAPI is running at \`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}\``, isLoading: false }
            : m
        )
      );
      setBackendOnline(false);
      setError(`Backend offline — start FastAPI at ${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}`); 
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, isLoading, studyMode, onSourcesUpdate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const copy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const retryConnection = async () => {
    setError(null);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/health`, { signal: AbortSignal.timeout(3000) });
      setBackendOnline(true);
    } catch {
      setError("Still offline — make sure FastAPI is running.");
    }
  };

  const activeDoc = documents.find((d) => d.status === "ready");

  return (
    /* ── Outer: fills the flex column given by page.tsx ──
       flex: 1 is the correct pattern here, NOT height: "100%".
       height:"100%" needs a definite parent height; flex:1 fills
       the main axis regardless — works on both mobile & desktop.
    */
    <div style={{
      display: "flex",
      flexDirection: "column",
      flex: 1,            /* fills tutor-wrapper (flex column) on ALL screen sizes */
      minHeight: 0,       /* prevents flex children from overflowing */
      overflow: "hidden",
      background: "var(--bg-base)",
      position: "relative",
    }}>

      {/* ── Controls Bar (fixed height) ── */}
      <div style={{
        padding: "8px 16px",
        background: "#fff",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
        flexShrink: 0,
        zIndex: 2,
      }}>
        {/* Backend status dot */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
          <div style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: backendOnline === true ? "#18A558" : backendOnline === false ? "#FF4B4B" : "#D4A000",
            boxShadow: backendOnline === true ? "0 0 0 2px rgba(24,165,88,0.2)" : "none",
          }} />
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>
            {backendOnline === true ? "API Live" : backendOnline === false ? "Offline" : "Checking…"}
          </span>
        </div>

        {/* Active doc chip */}
        {activeDoc && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 9px", background: "var(--pastel-mint)", border: "1px solid var(--pastel-mint-d)", borderRadius: "var(--radius-pill)", flexShrink: 0 }}>
            <FileText size={9} color="var(--success)" />
            <span style={{ fontSize: "10px", color: "var(--success)", fontWeight: 700, maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {activeDoc.name}
            </span>
          </div>
        )}

        {/* Persona pills */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "5px", flexShrink: 0 }}>
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setStudyMode(p.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: "5px 11px",
                  borderRadius: "var(--radius-pill)",
                  border: `1.5px solid ${studyMode === p.id ? "transparent" : "var(--border)"}`,
                  cursor: "pointer", fontSize: "11px", fontWeight: 700,
                  background: studyMode === p.id ? p.bg : "transparent",
                  color: studyMode === p.id ? p.color : "var(--text-muted)",
                  transition: "all 0.16s ease", whiteSpace: "nowrap",
                }}
              >
                <Icon size={11} /> {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          margin: "8px 14px 0",
          padding: "8px 12px",
          background: "#FFF0F0",
          border: "1px solid #FFBDBD",
          borderRadius: "10px",
          display: "flex", alignItems: "center", gap: "7px",
          flexShrink: 0,
          zIndex: 2,
        }}>
          <AlertCircle size={13} color="var(--error)" />
          <span style={{ fontSize: "12px", color: "var(--error)", flex: 1 }}>{error}</span>
          <button
            onClick={retryConnection}
            style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "1px solid #FFBDBD", borderRadius: "6px", cursor: "pointer", color: "var(--error)", fontSize: "11px", fontWeight: 700, padding: "2px 8px" }}
          >
            <RefreshCw size={10} /> Retry
          </button>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", fontSize: "18px", lineHeight: 1, padding: 0 }}>×</button>
        </div>
      )}

      {/* ── Messages (flex-1 scrollable) ── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        minHeight: 0,
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="animate-fade-in-up"
            style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}
          >
            {/* Role label */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
              {msg.role === "assistant" ? (
                <>
                  {/* AI Avatar: circular profile photo */}
                  {AI_AVATAR_URL ? (
                    <Image
                      src={AI_AVATAR_URL}
                      alt="PrinceAI"
                      width={28}
                      height={28}
                      style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                        border: "2px solid white",
                        boxShadow: "0 2px 8px rgba(66,85,255,0.25)",
                        width: "28px",
                        height: "28px",
                      }}
                    />
                  ) : (
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4255FF, #00C9DB)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Bot size={14} color="#fff" />
                    </div>
                  )}
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--brand-indigo)" }}>PrinceAI</span>
                  {msg.studyMode && (
                    <span className="badge badge-indigo" style={{ fontSize: "9px" }}>{msg.studyMode.replace("_", " ")}</span>
                  )}
                </>
              ) : (
                <>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>You</span>
                  <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <User size={12} color="var(--text-muted)" />
                  </div>
                </>
              )}
            </div>

            {/* Bubble */}
            {msg.role === "user" ? (
              <div className="chat-user-bubble">{msg.content}</div>
            ) : (
              <div className="chat-assistant-bubble" style={{ position: "relative", width: "100%", maxWidth: "680px" }}>
                {msg.isLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "2px 0" }}>
                    <Loader2 size={15} color="var(--brand-indigo)" className="animate-spin" />
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Querying knowledge base…</span>
                  </div>
                ) : (
                  <>
                    <div className="prose-light">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sources:</span>
                        {msg.sources.map((src, i) => (
                          <button
                            key={i}
                            className="citation-chip"
                            onClick={() => { onSourcesUpdate(msg.sources!); onOpenInspector(); }}
                          >
                            📄 Page {src.page}
                          </button>
                        ))}
                        <button
                          onClick={() => { onSourcesUpdate(msg.sources!); onOpenInspector(); }}
                          style={{ display: "flex", alignItems: "center", gap: "3px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "10px", fontWeight: 600 }}
                        >
                          <ExternalLink size={10} /> View All
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => copy(msg.id, msg.content)}
                      style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "3px" }}
                      title="Copy"
                    >
                      {copiedId === msg.id ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        {/* Scroll anchor */}
        <div ref={chatEndRef} style={{ height: "1px" }} />
      </div>

      {/* ── Quick Action Chips ── */}
      <div style={{
        background: "#fff",
        borderTop: "1px solid var(--border)",
        padding: "8px 14px 6px",
        display: "flex",
        gap: "6px",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        flexShrink: 0,
      }}>
        {QUICK_ACTIONS.map((qa) => {
          const Icon = qa.icon;
          return (
            <button
              key={qa.label}
              onClick={() => handleSend(qa.prompt)}
              disabled={isLoading}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "6px 12px",
                background: "var(--bg-elevated)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-pill)",
                color: "var(--text-secondary)",
                fontSize: "11px", fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.5 : 1,
                whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.16s ease",
              }}
              onMouseEnter={(e) => { if (!isLoading) { (e.currentTarget as HTMLElement).style.borderColor = "var(--brand-indigo)"; (e.currentTarget as HTMLElement).style.color = "var(--brand-indigo)"; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
            >
              <Icon size={11} color="var(--brand-indigo)" /> {qa.label}
            </button>
          );
        })}
      </div>

      {/* ── Sticky Input Bar ── */}
      <div
        className="chat-input-bar"
        style={{
          background: "#fff",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
          zIndex: 10,
          boxShadow: "0 -4px 20px rgba(66,85,255,0.06)",
          position: "relative",
          // Inline padding-bottom ensures the input is always above
          // the fixed MobileBottomBar on small screens.
          // chat-input-bar CSS class overrides this on md+.
        }}>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "flex-end",
            background: "var(--bg-elevated)",
            border: "1.5px solid var(--border)",
            borderRadius: "16px",
            padding: "8px 10px 8px 14px",
            transition: "border-color 0.18s, box-shadow 0.18s",
          }}
          onFocusCapture={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--brand-indigo)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(66,85,255,0.1)";
          }}
          onBlurCapture={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <textarea
            ref={inputRef}
            id="chat-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask PrinceAI… (Enter to send, Shift+Enter for newline)"
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "14px",
              fontFamily: "inherit",
              lineHeight: 1.5,
              resize: "none",
              overflowY: "hidden",
              minHeight: "24px",
              maxHeight: "120px",
            }}
          />
          <button
            id="send-message-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "11px",
              background: input.trim() && !isLoading ? "var(--brand-indigo)" : "var(--bg-elevated)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              transition: "all 0.18s ease",
              flexShrink: 0,
              boxShadow: input.trim() && !isLoading ? "0 2px 12px rgba(66,85,255,0.35)" : "none",
            }}
          >
            {isLoading
              ? <Loader2 size={15} color="var(--brand-indigo)" className="animate-spin" />
              : <Send size={15} color={input.trim() ? "#fff" : "var(--text-muted)"} />
            }
          </button>
        </div>

        {/* Footer hint */}
        <p style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center", marginTop: "6px" }}>
          RAG ·{" "}
          <span style={{ color: backendOnline ? "var(--success)" : "var(--error)", fontWeight: 700 }}>
            FastAPI {backendOnline ? "●" : "○"} :8000
          </span>
          {" "}·{" "}
          <strong style={{ color: "var(--brand-indigo)" }}>{studyMode.replace("_", " ")}</strong>
          {" "}mode
        </p>
      </div>
    </div>
  );
}
