"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { Flashcard, DifficultyRating } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Layers, Check, Star, ThumbsUp, ThumbsDown, Keyboard } from "lucide-react";

const DEMO_CARDS: Flashcard[] = [
  { id: generateId(), front: "What is the time complexity of Quicksort in the average case?", back: "**O(n log n)** average case.\n\nQuicksort uses divide-and-conquer partitioning. Worst case is **O(n²)** — occurs when the pivot is always the extremal element.", subject: "Algorithms", difficulty: "medium", tags: ["sorting", "complexity"] },
  { id: generateId(), front: "State Heisenberg's Uncertainty Principle", back: "**ΔxΔp ≥ ℏ/2**\n\nIt is fundamentally impossible to simultaneously know both the exact position (Δx) and exact momentum (Δp) of a particle.", subject: "Quantum Physics", difficulty: "hard", tags: ["quantum", "uncertainty"] },
  { id: generateId(), front: "What is the Central Dogma of Molecular Biology?", back: "**DNA → RNA → Protein**\n\n1. **Transcription**: DNA → mRNA\n2. **Translation**: mRNA → polypeptide", subject: "Molecular Biology", difficulty: "easy", tags: ["biology", "genetics"] },
  { id: generateId(), front: "Define O(1) — Constant Time complexity", back: "An algorithm runs in **O(1)** when execution time is **independent of input size**.\n\n**Examples:** Array index access, hash table lookup, stack push/pop.", subject: "Algorithms", difficulty: "easy", tags: ["big-o", "complexity"] },
  { id: generateId(), front: "Write the time-independent Schrödinger equation", back: "**Ĥψ = Eψ**\n\n- **Ĥ** = Hamiltonian operator (total energy)\n- **ψ** = Wave function\n- **E** = Energy eigenvalue", subject: "Quantum Physics", difficulty: "hard", tags: ["quantum", "wave function"] },
];

const DIFF_CFG: Record<DifficultyRating, { label: string; color: string; bg: string }> = {
  easy:    { label: "Easy",   color: "#18A558", bg: "#E8FDF2" },
  medium:  { label: "Medium", color: "#D4A000", bg: "#FFF8E0" },
  hard:    { label: "Hard",   color: "#FF4B4B", bg: "#FFF0F0" },
  unrated: { label: "—",      color: "#8F9BB3", bg: "var(--bg-elevated)" },
};

export default function FlashcardArena() {
  const [cards, setCards] = useState<Flashcard[]>(DEMO_CARDS);
  const [idx, setIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ know: 0, dontKnow: 0 });
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);
  const [showKeys, setShowKeys] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50;

  const card = cards[idx];
  const progress = completed.size / cards.length;

  const goNext = useCallback(() => {
    setIsFlipped(false);
    setSwipeDir("left");
    setTimeout(() => { setIdx((i) => (i + 1) % cards.length); setSwipeDir(null); }, 200);
  }, [cards.length]);

  const goPrev = useCallback(() => {
    setIsFlipped(false);
    setSwipeDir("right");
    setTimeout(() => { setIdx((i) => (i - 1 + cards.length) % cards.length); setSwipeDir(null); }, 200);
  }, [cards.length]);

  const rate = useCallback((type: "know" | "dontKnow") => {
    setStats((s) => ({ ...s, [type]: s[type] + 1 }));
    setCompleted((s) => new Set(s).add(card.id));
    setCards((prev) => prev.map((c) => c.id === card.id ? { ...c, difficulty: type === "know" ? "easy" : "hard" } : c));
    goNext();
  }, [card, goNext]);

  const shuffle = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setIdx(0); setIsFlipped(false);
    setCompleted(new Set()); setStats({ know: 0, dontKnow: 0 });
  };

  const reset = () => {
    setIdx(0); setIsFlipped(false);
    setCompleted(new Set()); setStats({ know: 0, dontKnow: 0 });
  };

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") { e.preventDefault(); setIsFlipped((f) => !f); }
      if (e.code === "ArrowRight") goNext();
      if (e.code === "ArrowLeft") goPrev();
      if (e.code === "KeyK") rate("know");
      if (e.code === "KeyD") rate("dontKnow");
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [goNext, goPrev, rate]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > SWIPE_THRESHOLD && dy < 60) {
      if (dx < 0) rate("dontKnow"); else rate("know");
    } else if (Math.abs(dx) < 10 && dy < 20) {
      setIsFlipped((f) => !f);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const diff = DIFF_CFG[card?.difficulty ?? "unrated"];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        gap: "14px",
        maxWidth: "700px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
        {[
          { label: "Total",  value: cards.length,     bg: "var(--pastel-purple)", color: "#4255FF" },
          { label: "Done",   value: completed.size,   bg: "var(--pastel-aqua)",   color: "#007A84" },
          { label: "Know",   value: stats.know,       bg: "var(--pastel-mint)",   color: "#18A558" },
          { label: "Study",  value: stats.dontKnow,   bg: "var(--pastel-rose)",   color: "#FF4B4B" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              borderRadius: "var(--radius-lg)",
              padding: "12px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px" }}>
            <Layers size={12} color="var(--brand-indigo)" /> Card {idx + 1} of {cards.length}
          </span>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--brand-indigo)" }}>
            {Math.round(progress * 100)}% complete
          </span>
        </div>
        <div className="progress-bar" style={{ height: "8px" }}>
          <div className="progress-bar-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* Card Meta */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="badge badge-indigo">{card?.subject}</span>
          {completed.has(card?.id) && <span className="badge badge-success"><Check size={9} /> Done</span>}
          <span style={{ padding: "2px 9px", borderRadius: "var(--radius-pill)", background: diff.bg, color: diff.color, fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px", border: `1px solid ${diff.color}30` }}>
            <Star size={9} /> {diff.label}
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={shuffle} className="btn-ghost" style={{ fontSize: "11px", padding: "4px 12px" }}>
            <Shuffle size={12} /> <span className="hidden sm:inline">Shuffle</span>
          </button>
          <button onClick={() => setShowKeys((v) => !v)} className="btn-ghost" style={{ fontSize: "11px", padding: "4px 10px" }}>
            <Keyboard size={12} />
          </button>
        </div>
      </div>

      {/* Keyboard hints */}
      {showKeys && (
        <div
          className="animate-fade-in"
          style={{
            padding: "10px 14px",
            background: "var(--pastel-purple)",
            borderRadius: "12px",
            fontSize: "11px",
            color: "var(--text-secondary)",
            display: "flex", flexWrap: "wrap", gap: "10px",
          }}
        >
          {[["Space","Flip"],["→","Next"],["←","Prev"],["K","Know"],["D","Don't Know"]].map(([key, action]) => (
            <span key={key}>
              <kbd style={{ padding: "2px 7px", background: "#fff", border: "1px solid var(--border)", borderRadius: "5px", fontFamily: "monospace", fontSize: "10px", color: "var(--brand-indigo)", fontWeight: 700, boxShadow: "0 1px 2px rgba(0,0,0,0.08)", marginRight: "4px" }}>
                {key}
              </kbd>
              {action}
            </span>
          ))}
        </div>
      )}

      {/* 3D Flip Card */}
      <div
        className="flip-card-scene"
        style={{ width: "100%", height: "230px", cursor: "pointer", flexShrink: 0 }}
        onClick={() => setIsFlipped((f) => !f)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}
          style={{
            transform: swipeDir === "left" ? "translateX(-18px) rotate(-1.5deg)" : swipeDir === "right" ? "translateX(18px) rotate(1.5deg)" : undefined,
            opacity: swipeDir ? 0.3 : 1,
            transition: swipeDir ? "transform 0.2s ease, opacity 0.2s ease" : undefined,
          }}
        >
          {/* Front */}
          <div
            className="flip-card-face"
            style={{
              background: "#FFFFFF",
              border: "2px solid var(--border)",
              boxShadow: "0 6px 0 #E2E8F0, 0 10px 30px rgba(66,85,255,0.08)",
            }}
          >
            <p style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
              QUESTION · Tap to flip
            </p>
            <h3 style={{ fontSize: "clamp(15px, 3vw, 20px)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.4, maxWidth: "480px" }}>
              {card?.front}
            </h3>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "16px" }}>
              {card?.tags.map((tag) => (
                <span key={tag} style={{ fontSize: "10px", padding: "2px 10px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-pill)", color: "var(--text-muted)", fontWeight: 600 }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Back */}
          <div
            className="flip-card-face flip-card-back"
            style={{
              background: "var(--pastel-purple)",
              border: "2px solid rgba(66,85,255,0.2)",
              boxShadow: "0 6px 0 rgba(66,85,255,0.15), 0 10px 30px rgba(66,85,255,0.1)",
            }}
          >
            <p style={{ fontSize: "10px", fontWeight: 800, color: "var(--brand-indigo)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
              ANSWER · Tap to flip back
            </p>
            <div
              style={{ fontSize: "clamp(13px, 2.5vw, 15px)", color: "var(--text-primary)", lineHeight: 1.75, maxWidth: "480px", textAlign: "left" }}
              dangerouslySetInnerHTML={{
                __html: card?.back.split("\n").map((line) => line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")).join("<br/>"),
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile swipe hint */}
      <p className="md:hidden" style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)" }}>
        ← Swipe left = Study more · Swipe right = Know it →
      </p>

      {/* Know / Don't Know Buttons */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", paddingBottom: "4px" }}>
        <button id="rate-dont-know" className="btn-dont-know" onClick={() => rate("dontKnow")} style={{ flex: 1, maxWidth: "200px" }}>
          <ThumbsDown size={16} /> Study More
        </button>
        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          <button onClick={goPrev} className="btn-ghost" style={{ width: "42px", height: "42px", padding: 0, justifyContent: "center", borderRadius: "12px" }}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={goNext} className="btn-ghost" style={{ width: "42px", height: "42px", padding: 0, justifyContent: "center", borderRadius: "12px" }}>
            <ChevronRight size={18} />
          </button>
        </div>
        <button id="rate-know" className="btn-know" onClick={() => rate("know")} style={{ flex: 1, maxWidth: "200px" }}>
          <ThumbsUp size={16} /> Know It!
        </button>
      </div>

      <button onClick={reset} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "12px" }}>
        <RotateCcw size={12} /> Reset session
      </button>
    </div>
  );
}
