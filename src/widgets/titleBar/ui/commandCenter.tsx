"use client";

import { useEffect, useRef, useState } from "react";
import { Codicon } from "@/shared/ui";
import { QuickOpen, QUICK_ACTIONS, RECENT_FILES } from "@/features/quickOpen";

export function CommandCenter() {
  const [cmdActive, setCmdActive] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [quickOpenIndex, setQuickOpenIndex] = useState(0);
  const cmdInputRef = useRef<HTMLInputElement>(null);
  const cmdPillRef = useRef<HTMLDivElement>(null);

  const openCmd = () => {
    setCmdActive(true);
    setQuickOpenIndex(0);
    requestAnimationFrame(() => cmdInputRef.current?.focus());
  };
  const closeCmd = () => {
    setCmdActive(false);
    setCmdQuery("");
    setQuickOpenIndex(0);
  };

  useEffect(() => {
    if (!cmdActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCmd();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [cmdActive]);

  useEffect(() => {
    if (!cmdActive) return;
    const handler = (e: MouseEvent) => {
      if (!cmdPillRef.current?.contains(e.target as Node)) closeCmd();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cmdActive]);

  const totalQuickItems =
    cmdQuery === ""
      ? QUICK_ACTIONS.length + RECENT_FILES.length
      : RECENT_FILES.filter(
          (f) =>
            f.name.toLowerCase().includes(cmdQuery.toLowerCase()) ||
            f.path.toLowerCase().includes(cmdQuery.toLowerCase()),
        ).length;

  const handlePillKeyDown = (e: React.KeyboardEvent) => {
    if (!cmdActive) return;
    if (e.key === "ArrowDown" && totalQuickItems > 0) {
      e.preventDefault();
      setQuickOpenIndex((i) => Math.min(i + 1, totalQuickItems - 1));
    } else if (e.key === "ArrowUp" && totalQuickItems > 0) {
      e.preventDefault();
      setQuickOpenIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      closeCmd();
    }
  };

  const quickOpenInputIdentifier = "quickopen-input";

  return (
    <div className="flex items-center gap-0.5 min-w-0 justify-self-center">
      <button
        title="Go Back (Alt+Left)"
        aria-label="Go Back"
        type="button"
        className="nav-btn"
      >
        <Codicon icon="codicon-arrow-left" size={16} />
      </button>
      <button
        title="Go Forward (Alt+Right)"
        aria-label="Go Forward"
        type="button"
        className="nav-btn"
      >
        <Codicon icon="codicon-arrow-right" size={16} />
      </button>

      <div
        ref={cmdPillRef}
        className="relative ml-1.5"
        onKeyDown={handlePillKeyDown}
      >
        <div className="cmd-pill" data-active={cmdActive} onClick={openCmd}>
          <Codicon
            icon="codicon-search"
            size={12}
            className="shrink-0 opacity-[0.62]"
          />
          {cmdActive ? (
            <input
              ref={cmdInputRef}
              id={quickOpenInputIdentifier}
              role="combobox"
              aria-expanded={cmdActive}
              aria-controls="quickopen-listbox"
              aria-activedescendant={`quickopen-item-${quickOpenIndex}`}
              aria-autocomplete="list"
              aria-label="Search files by name"
              value={cmdQuery}
              onChange={(e) => {
                setCmdQuery(e.target.value);
                setQuickOpenIndex(0);
              }}
              placeholder="Search files by name (append : to go to line or @ to go to symbol)"
              className="quick-open-input flex-1 bg-transparent border-0 outline-none min-w-0 text-vscode-fg text-[12px] font-sans"
            />
          ) : (
            <span className="flex-1 text-[12px] opacity-[0.86]">screet</span>
          )}
          <Codicon
            icon="codicon-chevron-down"
            size={12}
            className="shrink-0 opacity-50"
          />
        </div>
        {cmdActive && (
          <QuickOpen
            query={cmdQuery}
            activeIndex={quickOpenIndex}
            onActiveIndexChange={setQuickOpenIndex}
            onClose={closeCmd}
          />
        )}
      </div>
    </div>
  );
}
