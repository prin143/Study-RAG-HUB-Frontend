// ============================================================
// Study RAG Hub — Core Type Definitions
// ============================================================

export type StudyMode = "general" | "exam_prep" | "summary";

export type DocumentStatus = "uploading" | "indexing" | "ready" | "error";

export type DifficultyRating = "easy" | "medium" | "hard" | "unrated";

export type ActiveModule =
  | "dashboard"
  | "library"
  | "tutor"
  | "profile"
  | "admin";

// ─── Document Library ──────────────────────────────────────

export interface StudyDocument {
  id: string;
  name: string;
  type: "pdf" | "docx" | "txt";
  size: number; // bytes
  totalPages: number;
  totalChunks: number;
  status: DocumentStatus;
  uploadedAt: Date;
  subject?: string;
  coverColor: string; // tailwind bg color class
}

// ─── Chat / RAG ────────────────────────────────────────────

export interface Source {
  page: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  studyMode?: StudyMode;
  timestamp: Date;
  isLoading?: boolean;
}

export interface AskRequest {
  question: string;
  study_mode: StudyMode;
  /** Optional: restrict RAG search to a single uploaded document by its exact filename.
   *  When undefined/null the backend searches all uploaded vectors (general mode). */
  document_filename?: string | null;
}

export interface AskResponse {
  answer: string;
  sources: Source[];
}

export interface UploadResponse {
  filename: string;
  total_pages: number;
  total_chunks: number;
  message?: string;
}

// ─── Flashcards ────────────────────────────────────────────

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  difficulty: DifficultyRating;
  lastReviewed?: Date;
  tags: string[];
}

// ─── Notes ─────────────────────────────────────────────────

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

// ─── Analytics / Profile ───────────────────────────────────

export interface StudySession {
  date: string; // YYYY-MM-DD
  minutes: number;
}

export interface UserProfile {
  name: string;
  email: string;
  institution: string;
  examTargets: string[];
  studyStreak: number; // days
  totalStudyMinutes: number;
  sessionsHistory: StudySession[];
  savedCitations: Source[];
  documentsCount: number;
  flashcardsCount: number;
}

// ─── Toast Notifications ───────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}
