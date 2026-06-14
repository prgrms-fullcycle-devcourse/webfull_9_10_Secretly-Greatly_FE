"use client";

import { useEffect, useState } from "react";
import { VscodeIcon } from "@/shared/ui";

import { MacWindowControls } from "./macWindowControls";
import { WindowControls } from "./windowControls";
import { MenuBar } from "./menuBar";
import { CommandCenter } from "./commandCenter";
import { LayoutControls } from "./layoutControls";

/* ── TitleBar ── */
interface TitleBarProps {
  onToggleSidebar?: () => void;
  onTogglePanel?: () => void;
  onToggleSecondarySidebar?: () => void;
}

export function TitleBar({
  onToggleSidebar,
  onTogglePanel,
  onToggleSecondarySidebar,
}: TitleBarProps = {}) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMac(navigator.userAgent.toLowerCase().includes("mac"));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header
      className="shrink-0 select-none relative
                 h-(--titlebar-height) bg-vscode-titlebar text-vscode-fg-titlebar
                 text-(length:--font-size-md) z-(--z-titlebar)
                 grid grid-cols-[auto_minmax(260px,1fr)_auto] items-center
                 border-b border-vscode-border-titlebar"
    >
      {/* Left: logo + menu */}
      <div className="flex items-center h-full min-w-0">
        {isMac ? (
          <MacWindowControls />
        ) : (
          <div className="w-[34px] h-full flex items-center justify-center shrink-0">
            <VscodeIcon size={17} />
          </div>
        )}
        <MenuBar />
      </div>

      {/* Center: nav + command center */}
      <CommandCenter />

      {/* Right: layout icons + window controls */}
      <div
        className={`flex items-center h-full justify-self-end ${isMac ? "pr-4" : ""}`}
      >
        <LayoutControls
          onToggleSidebar={onToggleSidebar}
          onTogglePanel={onTogglePanel}
          onToggleSecondarySidebar={onToggleSecondarySidebar}
        />
        {!isMac && <WindowControls />}
      </div>
    </header>
  );
}
