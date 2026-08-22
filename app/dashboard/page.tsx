"use client";

import React, { useState, useCallback } from "react";
import type { ActiveModule, StudyDocument, Source } from "@/lib/types";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import AuthModal from "@/components/auth/AuthModal";

import Dashboard from "@/components/modules/Dashboard";
import DocumentLibrary from "@/components/modules/DocumentLibrary";
import AcademicTutor from "@/components/modules/AcademicTutor";
import InspectorPanel from "@/components/modules/InspectorPanel";
import UserProfile from "@/components/modules/UserProfile";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function DashboardPage() {
  const [activeModule, setActiveModule] = useState<ActiveModule>("dashboard");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [activeSources, setActiveSources] = useState<Source[]>([]);

  const handleModuleChange = useCallback((m: string) => {
    setActiveModule(m as ActiveModule);
  }, []);

  const handleSourcesUpdate = useCallback((sources: Source[]) => {
    setActiveSources(sources);
  }, []);

  const handleDocumentsChange = useCallback(
    (
      docsOrUpdater:
        | StudyDocument[]
        | ((prev: StudyDocument[]) => StudyDocument[])
    ) => {
      if (typeof docsOrUpdater === "function") {
        setDocuments(docsOrUpdater);
      } else {
        setDocuments(docsOrUpdater);
      }
    },
    []
  );

  const showInspector = activeModule === "tutor";

  return (
    <div className="app-shell">
      {/* Sidebar — always visible desktop panel */}
      <Sidebar
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />

      {/* Main Content Column */}
      <div className="content-area">
        <TopBar
          onAuthOpen={(tab) => { setAuthTab(tab); setAuthModalOpen(true); }}
          onModuleChange={handleModuleChange}
        />

        {/* Module + Inspector row */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", minHeight: 0 }}>

          {/* ── Tutor: manages its own internal scroll ── */}
          {activeModule === "tutor" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0, minWidth: 0 }}>
              <AcademicTutor
                documents={documents}
                onSourcesUpdate={handleSourcesUpdate}
                onOpenInspector={() => {}}
              />
            </div>
          )}

          {/* ── All other modules: scroll via module-scroll wrapper ── */}
          {activeModule !== "tutor" && (
            <div className="module-scroll" style={{ flex: 1, minWidth: 0 }}>
              {activeModule === "dashboard" && (
                <Dashboard
                  documents={documents}
                  onModuleChange={handleModuleChange}
                  onSourcesUpdate={handleSourcesUpdate}
                />
              )}
              {activeModule === "library" && (
                <DocumentLibrary
                  documents={documents}
                  onDocumentsChange={handleDocumentsChange}
                />
              )}
              {activeModule === "profile"  && <UserProfile />}
              {activeModule === "admin"    && <AdminDashboard />}
            </div>
          )}

          {/* Inspector — always visible on desktop when tutor is active */}
          {showInspector && (
            <InspectorPanel
              sources={activeSources}
              isSheet={false}
              isOpen={true}
              onClose={() => {}}
            />
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authTab}
      />
    </div>
  );
}
