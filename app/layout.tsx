import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "StudyRag Hub — Learn Smarter. Remember More.",
  description: "Smart Academic Study RAG Platform powered by Retrieval-Augmented Generation.",
  keywords: ["study platform", "RAG", "AI tutor", "academic research", "flashcards", "exam prep"],
  authors: [{ name: "Study RAG Hub" }],
  icons: {
    icon: "/studyraghub-logo.png",
    apple: "/studyraghub-logo.png",
    shortcut: "/studyraghub-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4255FF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
