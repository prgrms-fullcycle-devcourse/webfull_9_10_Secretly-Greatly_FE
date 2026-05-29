"use client";

import { useState } from "react";
import { Codicon, FileIcon } from "@/shared/ui";
import { MOCK_TABS } from "./mockData";

export function EditorGroup() {
  const [tabs, setTabs] = useState(MOCK_TABS);
  const [activeTabKey, setActiveTabKey] = useState<string>("1");

  const activeTab = tabs.find((t) => t.id === activeTabKey) ?? tabs[0];

  function handleCloseTab(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (activeTabKey === id && next.length > 0) {
      // activate the tab to the left, or the first remaining one
      const closedIdx = tabs.findIndex((t) => t.id === id);
      setActiveTabKey(next[Math.max(0, closedIdx - 1)].id);
    }
  }

  if (tabs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-vscode-editor text-vscode-fg-desc text-[length:var(--font-size-lg)]">
        No editors open
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-vscode-editor text-vscode-fg">
      {/* Tab Bar */}
      <div
        role="tablist"
        aria-label="Editor tabs"
        className="flex shrink-0 items-end overflow-hidden bg-vscode-tab-inactive h-[var(--tabbar-height)]"
        onKeyDown={(e) => {
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          if ((e.target as Element).closest(".tab-close")) return;
          e.preventDefault();
          const tabEls = Array.from(
            (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
              '[role="tab"]',
            ),
          );
          const idx = tabEls.indexOf(document.activeElement as HTMLElement);
          if (idx === -1) return;
          const next =
            e.key === "ArrowRight"
              ? tabEls[(idx + 1) % tabEls.length]
              : tabEls[(idx - 1 + tabEls.length) % tabEls.length];
          const nextTabKey = (next as HTMLElement | null)?.dataset.tabId;
          if (nextTabKey) setActiveTabKey(nextTabKey);
          next?.focus();
        }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tab"
            data-tab-id={tab.id}
            tabIndex={activeTabKey === tab.id ? 0 : -1}
            aria-selected={activeTabKey === tab.id}
            aria-controls={`editor-panel-${tab.id}`}
            className="editor-tab"
            data-active={activeTabKey === tab.id}
            onClick={() => setActiveTabKey(tab.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveTabKey(tab.id);
              }
            }}
          >
            <FileIcon filename={tab.filename} size={16} />
            <span>{tab.filename}</span>
            <button
              type="button"
              tabIndex={-1}
              className="tab-close"
              aria-label={`Close ${tab.filename}`}
              onClick={(e) => handleCloseTab(e, tab.id)}
            >
              <Codicon icon="codicon-close" size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex shrink-0 items-center gap-1 px-2 text-vscode-fg-desc h-[22px] text-[length:var(--font-size-md)]"
      >
        {activeTab.path.map((segment, i) => (
          <span key={`${i}-${segment}`} className="contents">
            <span>{segment}</span>
            <Codicon icon="codicon-chevron-right" size={14} />
          </span>
        ))}
        <span className="flex items-center gap-1 text-vscode-fg">
          <FileIcon filename={activeTab.filename} size={14} />
          {activeTab.filename}
        </span>
      </nav>

      {/* Editor Content */}
      <div
        id={`editor-panel-${activeTab.id}`}
        role="tabpanel"
        aria-label={activeTab.filename}
        className="flex-1 overflow-auto bg-vscode-editor font-mono"
      >
        <div className="min-w-full py-2 text-[13px] leading-[22px]">
          {activeTab.content.map((line, index) => (
            <div key={`${activeTab.id}-${index}`} className="flex min-h-[22px]">
              <span
                aria-hidden="true"
                className="shrink-0 select-none text-right text-vscode-line-number w-[var(--gutter-width)] pr-[14px]"
              >
                {index + 1}
              </span>
              <code className="whitespace-pre text-vscode-fg">{line}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
