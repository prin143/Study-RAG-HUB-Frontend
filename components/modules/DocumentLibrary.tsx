"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload, FileText, CheckCircle, AlertCircle, Loader2,
  Trash2, Eye, MoreVertical, BookOpen, Layers, Plus, File,
} from "lucide-react";
import type { StudyDocument } from "@/lib/types";
import { uploadDocument } from "@/lib/api";
import { generateId, formatFileSize, formatRelativeTime } from "@/lib/utils";

const DEMO_DOCS: StudyDocument[] = [
  { id: "d1", name: "Advanced Algorithms & Data Structures.pdf", type: "pdf", size: 4_200_000, totalPages: 312, totalChunks: 894, status: "ready", uploadedAt: new Date(Date.now() - 86_400_000 * 2), subject: "Computer Science", coverColor: "#4255FF" },
  { id: "d2", name: "Quantum Mechanics — Griffiths 4th Edition.pdf", type: "pdf", size: 8_100_000, totalPages: 508, totalChunks: 1432, status: "ready", uploadedAt: new Date(Date.now() - 86_400_000 * 5), subject: "Physics", coverColor: "#00C9DB" },
  { id: "d3", name: "Molecular Biology of the Cell.pdf", type: "pdf", size: 12_500_000, totalPages: 780, totalChunks: 2100, status: "ready", uploadedAt: new Date(Date.now() - 86_400_000 * 7), subject: "Biology", coverColor: "#18A558" },
];

interface DocumentLibraryProps {
  documents: StudyDocument[];
  onDocumentsChange: (docsOrUpdater: StudyDocument[] | ((prev: StudyDocument[]) => StudyDocument[])) => void;
}

export default function DocumentLibrary({ documents, onDocumentsChange }: DocumentLibraryProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  useEffect(() => { if (documents.length === 0) onDocumentsChange(DEMO_DOCS); }, []);

  const handleFile = useCallback(async (file: File) => {
    setIsUploading(true); setUploadError(null); setUploadSuccess(null); setUploadProgress(0);
    const tempDoc: StudyDocument = { id: generateId(), name: file.name, type: "pdf", size: file.size, totalPages: 0, totalChunks: 0, status: "uploading", uploadedAt: new Date(), subject: "New Document", coverColor: "#4255FF" };
    onDocumentsChange([tempDoc, ...documents]);
    try {
      const res = await uploadDocument(file, setUploadProgress);
      onDocumentsChange((prev) => prev.map((d) => d.id === tempDoc.id ? { ...d, name: res.filename || file.name, totalPages: res.total_pages, totalChunks: res.total_chunks, status: "ready" as const } : d));
      setUploadSuccess(`"${res.filename}" — ${res.total_pages} pages indexed successfully`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      onDocumentsChange((prev) => prev.map((d) => d.id === tempDoc.id ? { ...d, status: "error" as const } : d));
      setUploadError(msg);
    } finally { setIsUploading(false); setUploadProgress(0); }
  }, [documents, onDocumentsChange]);

  const onDrop = useCallback((files: File[]) => { if (files[0]) handleFile(files[0]); }, [handleFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "application/pdf": [".pdf"] }, multiple: false, disabled: isUploading });

  const mobileInputRef = React.useRef<HTMLInputElement>(null);
  const handleMobilePick = () => mobileInputRef.current?.click();
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; };

  const removeDoc = (id: string) => onDocumentsChange(documents.filter((d) => d.id !== id));
  const allDocs = documents.length > 0 ? documents : DEMO_DOCS;

  const STATUS_CFG: Record<StudyDocument["status"], { label: string; badgeClass: string; spin: boolean }> = {
    ready:    { label: "100% Ready", badgeClass: "badge badge-success", spin: false },
    indexing: { label: "Indexing…",  badgeClass: "badge badge-warning", spin: true  },
    uploading:{ label: "Uploading…", badgeClass: "badge badge-info",    spin: true  },
    error:    { label: "Error",      badgeClass: "badge badge-error",   spin: false },
  };

  const PASTEL_BG: Record<string, string> = {
    "#4255FF": "var(--pastel-purple)",
    "#00C9DB": "var(--pastel-aqua)",
    "#18A558": "var(--pastel-mint)",
    "#FF6B8A": "var(--pastel-rose)",
    "#FF8C42": "var(--pastel-orange)",
  };

  return (
    <div style={{ minHeight: "100%", padding: "20px", background: "var(--bg-base)" }}>
      <input ref={mobileInputRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleMobileChange} />

      {/* Page heading */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontFamily: "'Poppins','Inter',sans-serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "4px" }}>
          Your Study Library
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Upload PDFs to index them for AI-powered RAG queries.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
        {[
          { icon: BookOpen, label: "Documents", value: allDocs.length.toString(),                                       bg: "var(--pastel-purple)", color: "#4255FF" },
          { icon: File,     label: "Pages",     value: allDocs.reduce((a, d) => a + d.totalPages, 0).toLocaleString(), bg: "var(--pastel-aqua)",   color: "#007A84" },
          { icon: Layers,   label: "Chunks",    value: allDocs.reduce((a, d) => a + d.totalChunks, 0).toLocaleString(),bg: "var(--pastel-mint)",   color: "#18A558" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: s.bg, borderRadius: "var(--radius-xl)", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Icon size={18} color={s.color} />
              <div>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px", fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Dropzone */}
      <div
        {...getRootProps()}
        className={`hidden sm:flex ${isDragActive ? "dropzone-active" : ""}`}
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: `2px dashed ${isDragActive ? "var(--brand-indigo)" : "var(--border)"}`,
          borderRadius: "var(--radius-2xl)",
          padding: "28px 20px",
          textAlign: "center",
          cursor: isUploading ? "not-allowed" : "pointer",
          background: isDragActive ? "var(--brand-indigo-lt)" : "#fff",
          transition: "all 0.22s ease",
          marginBottom: "16px",
          boxShadow: isDragActive ? "0 0 0 4px rgba(66,85,255,0.1)" : "none",
        }}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div style={{ width: "100%", maxWidth: "300px" }}>
            <Loader2 size={36} color="var(--brand-indigo)" className="animate-spin" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>Uploading & Indexing…</p>
            <div className="progress-bar" style={{ height: "8px" }}>
              <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p style={{ fontSize: "13px", color: "var(--brand-indigo)", fontWeight: 800, marginTop: "6px" }}>{uploadProgress}%</p>
          </div>
        ) : (
          <>
            <div style={{ width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: isDragActive ? "var(--brand-indigo)" : "var(--pastel-purple)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 2px 12px rgba(66,85,255,0.15)" }}>
              <Upload size={24} color={isDragActive ? "#fff" : "var(--brand-indigo)"} />
            </div>
            <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
              {isDragActive ? "Drop your PDF here!" : "Upload a Study Document"}
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>
              Drag & drop or <span style={{ color: "var(--brand-indigo)", fontWeight: 700 }}>browse files</span> · PDF only · Max 100MB
            </p>
            <span className="badge badge-indigo">Supports PDF · Auto-indexed by RAG</span>
          </>
        )}
      </div>

      {/* Mobile Upload Button */}
      <div className="sm:hidden" style={{ marginBottom: "16px" }}>
        {isUploading ? (
          <div style={{ padding: "16px", background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
            <Loader2 size={28} color="var(--brand-indigo)" className="animate-spin" style={{ margin: "0 auto 8px" }} />
            <p style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>Uploading… {uploadProgress}%</p>
            <div className="progress-bar" style={{ marginTop: "10px", height: "8px" }}>
              <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <button onClick={handleMobilePick} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "15px", borderRadius: "var(--radius-xl)" }}>
            <Upload size={18} /> Choose PDF to Upload
          </button>
        )}
      </div>

      {/* Alerts */}
      {uploadSuccess && (
        <div className="animate-fade-in" style={{ padding: "11px 14px", background: "var(--pastel-mint)", border: "1px solid var(--pastel-mint-d)", borderRadius: "12px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "7px" }}>
          <CheckCircle size={14} color="var(--success)" />
          <span style={{ fontSize: "13px", color: "var(--success)", flex: 1, fontWeight: 600 }}>{uploadSuccess}</span>
          <button onClick={() => setUploadSuccess(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--success)", fontSize: "18px", lineHeight: 1 }}>×</button>
        </div>
      )}
      {uploadError && (
        <div className="animate-fade-in" style={{ padding: "11px 14px", background: "#FFF0F0", border: "1px solid #FFBDBD", borderRadius: "12px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "7px" }}>
          <AlertCircle size={14} color="var(--error)" />
          <span style={{ fontSize: "13px", color: "var(--error)", flex: 1 }}>{uploadError}</span>
          <button onClick={() => setUploadError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error)", fontSize: "18px", lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Library Grid Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
          Documents <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>({allDocs.length})</span>
        </h2>
        <button
          className="btn-ghost"
          style={{ fontSize: "11px", padding: "5px 12px" }}
          onClick={() => alert("Folder organisation is coming soon! For now all documents are in one library.")}
          title="New Folder (coming soon)"
        >
          <Plus size={12} /> New Folder
        </button>
      </div>

      {/* Document Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: "12px" }}>
        {allDocs.map((doc) => {
          const st = STATUS_CFG[doc.status];
          const pastelBg = PASTEL_BG[doc.coverColor] ?? "var(--pastel-purple)";
          return (
            <div key={doc.id} className="card card-hover" style={{ padding: "18px", position: "relative", overflow: "hidden" }}>
              {/* Top accent strip */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${doc.coverColor}, transparent)`, borderRadius: "var(--radius-xl) var(--radius-xl) 0 0" }} />

              {/* Doc icon */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ width: "44px", height: "52px", borderRadius: "10px", background: pastelBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileText size={22} color={doc.coverColor} />
                </div>
                <button
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px" }}
                  title="More options"
                  onClick={() => alert(`Options for: ${doc.name}\n\n• Rename\n• Move\n• Export\n\n(Full menu coming soon)`)}
                >
                  <MoreVertical size={15} />
                </button>
              </div>

              {/* Name */}
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: "6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {doc.name}
              </p>
              {doc.subject && <span className="badge badge-indigo" style={{ fontSize: "9px", marginBottom: "10px", display: "inline-flex" }}>{doc.subject}</span>}

              {/* Metadata grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", marginBottom: "12px" }}>
                {[
                  { label: "Pages",  value: doc.totalPages  ? doc.totalPages.toLocaleString()  : "—" },
                  { label: "Chunks", value: doc.totalChunks ? doc.totalChunks.toLocaleString() : "—" },
                  { label: "Size",   value: formatFileSize(doc.size) },
                  { label: "Added",  value: formatRelativeTime(doc.uploadedAt) },
                ].map((m) => (
                  <div key={m.label} style={{ padding: "5px 8px", background: "var(--bg-elevated)", borderRadius: "8px" }}>
                    <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 600 }}>{m.label}</div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)" }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className={st.badgeClass} style={{ fontSize: "9px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  {st.spin && <Loader2 size={9} className="animate-spin" />}
                  {!st.spin && doc.status === "ready" && <CheckCircle size={9} />}
                  {st.label}
                </span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    title="View document info"
                    style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1.5px solid var(--border)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}
                    onClick={() => alert(`Document: ${doc.name}\nPages: ${doc.totalPages}\nChunks: ${doc.totalChunks}\nStatus: ${doc.status}\n\nOpen this document in the PrinceAI chat to query it!`)}
                  >
                    <Eye size={12} />
                  </button>
                  <button onClick={() => removeDoc(doc.id)} title="Remove" style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1.5px solid #FFBDBD", background: "#FFF0F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--error)" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
