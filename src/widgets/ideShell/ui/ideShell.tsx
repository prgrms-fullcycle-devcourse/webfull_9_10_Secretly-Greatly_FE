"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useState } from "react";
import { ActivityBar } from "./activityBar";
import { EditorGroup } from "./editorGroup";
import { PanelArea } from "./panelArea";
import { Sidebar } from "./sidebar";
import { StatusBar } from "./statusBar";
import { TitleBar } from "./titleBar";

const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_MAX_WIDTH = 560;
const PANEL_MIN_HEIGHT = 120;
const PANEL_MAX_HEIGHT_OFFSET = 180;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function IdeShell() {
  const [activeView, setActiveView] = useState<string | null>("explorer");
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [panelHeight, setPanelHeight] = useState(220);

  const handleViewChange = (id: string) => {
    setActiveView((prev) => (prev === id ? null : id));
  };

  const startSidebarResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;
    document.body.dataset.resizing = "sidebar";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextWidth = startWidth + moveEvent.clientX - startX;
      setSidebarWidth(clamp(nextWidth, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH));
    };

    const stopResize = () => {
      document.body.removeAttribute("data-resizing");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
  };

  const startPanelResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = panelHeight;
    document.body.dataset.resizing = "panel";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const maxHeight = Math.max(
        PANEL_MIN_HEIGHT,
        window.innerHeight - PANEL_MAX_HEIGHT_OFFSET,
      );
      const nextHeight = startHeight - (moveEvent.clientY - startY);
      setPanelHeight(clamp(nextHeight, PANEL_MIN_HEIGHT, maxHeight));
    };

    const stopResize = () => {
      document.body.removeAttribute("data-resizing");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
  };

  const resizePanelWithKeyboard = (delta: number) => {
    const maxHeight = Math.max(
      PANEL_MIN_HEIGHT,
      window.innerHeight - PANEL_MAX_HEIGHT_OFFSET,
    );
    setPanelHeight((value) =>
      clamp(value + delta, PANEL_MIN_HEIGHT, maxHeight),
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-vscode-window">
      <TitleBar />

      {/* workbench */}
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar activeView={activeView} onViewChange={handleViewChange} />
        {activeView && (
          <>
            <Sidebar view={activeView} width={sidebarWidth} />
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize side bar"
              className="resize-handle resize-handle-vertical"
              tabIndex={0}
              onPointerDown={startSidebarResize}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  setSidebarWidth((value) =>
                    clamp(value - 10, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH),
                  );
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  setSidebarWidth((value) =>
                    clamp(value + 10, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH),
                  );
                }
              }}
            />
          </>
        )}

        {/* main-area: editor + panel vertical split */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <EditorGroup />
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize panel"
            className="resize-handle resize-handle-horizontal"
            tabIndex={0}
            onPointerDown={startPanelResize}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp") {
                event.preventDefault();
                resizePanelWithKeyboard(10);
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                resizePanelWithKeyboard(-10);
              }
            }}
          />
          <PanelArea height={panelHeight} />
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
