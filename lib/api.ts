// ============================================================
// Study RAG Hub — FastAPI Backend Client
// ============================================================

import type { AskRequest, AskResponse, UploadResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ─── Upload Document ───────────────────────────────────────

export async function uploadDocument(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data: UploadResponse = JSON.parse(xhr.responseText);
          resolve(data);
        } catch {
          reject(new Error("Invalid JSON response from server"));
        }
      } else {
        // ── Backend responded but rejected the file (400/422/500) ──
        // Try to extract FastAPI's 'detail' field for a helpful message.
        let userMessage = `Upload failed (HTTP ${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText);
          if (typeof body.detail === "string") {
            userMessage = body.detail;
          } else if (Array.isArray(body.detail) && body.detail[0]?.msg) {
            // FastAPI validation error array format
            userMessage = body.detail.map((e: { msg: string }) => e.msg).join(", ");
          } else if (typeof body.message === "string") {
            userMessage = body.message;
          }
        } catch {
          // Response isn't JSON — use raw text if short enough
          if (xhr.responseText && xhr.responseText.length < 300) {
            userMessage = xhr.responseText;
          }
        }
        reject(new Error(userMessage));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error(`Backend Offline — cannot reach ${API_BASE}`));
    });

    xhr.addEventListener("timeout", () => {
      reject(new Error("Request timeout — backend may be offline"));
    });

    xhr.timeout = 120_000; // 2 min timeout for large PDFs
    xhr.open("POST", `${API_BASE}/upload`);
    xhr.send(formData);
  });
}

// ─── RAG Ask / Chat ────────────────────────────────────────

export async function askQuestion(
  payload: AskRequest
): Promise<AskResponse> {
  const response = await fetch(`${API_BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`RAG query failed (${response.status}): ${errorText}`);
  }

  const data: AskResponse = await response.json();
  return data;
}

// ─── Health Check ──────────────────────────────────────────

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(3_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
