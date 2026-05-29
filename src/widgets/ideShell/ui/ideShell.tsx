"use client";

import { useState } from "react";
import { ActivityBar } from "./activityBar";
import { EditorGroup } from "./editorGroup";
import { PanelArea } from "./panelArea";
import { Sidebar } from "./sidebar";
import { StatusBar } from "./statusBar";
import { TitleBar } from "./titleBar";

export function IdeShell() {
  const [activeView, setActiveView] = useState<string | null>("explorer");

  const handleViewChange = (id: string) => {
    setActiveView((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-vscode-window">
      <TitleBar />

      {/* workbench */}
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar activeView={activeView} onViewChange={handleViewChange} />
        <Sidebar view={activeView} />

        {/* main-area: editor + panel 수직 분할 */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <EditorGroup />
          <PanelArea />
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
