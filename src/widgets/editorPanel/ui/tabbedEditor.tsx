"use client";

import { Codicon, FileIcon } from "@/shared/ui";
import type { MockTab } from "@/widgets/mockData";

interface TabbedEditorProps {
  tabs: MockTab[];
  activeTabKey: string;
  onActiveTabChange: (id: string) => void;
  onCloseTab: (id: string) => void;
}

export function TabbedEditor({
  tabs,
  activeTabKey,
  onActiveTabChange,
  onCloseTab,
}: TabbedEditorProps) {
  const activeTab = tabs.find((t) => t.id === activeTabKey) ?? tabs[0];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-vscode-editor text-vscode-fg">
      <div
        role="tablist"
        aria-label="Editor tabs"
        className="flex shrink-0 items-end overflow-hidden bg-vscode-tab-inactive h-(--tabbar-height)"
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          if ((event.target as Element).closest(".tab-close")) return;

          event.preventDefault();
          const tabElements = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'),
          );
          const index = tabElements.indexOf(
            document.activeElement as HTMLElement,
          );
          if (index === -1) return;

          const next =
            event.key === "ArrowRight"
              ? tabElements[(index + 1) % tabElements.length]
              : tabElements[
                  (index - 1 + tabElements.length) % tabElements.length
                ];
          const nextTabKey = next?.dataset.tabId;

          if (nextTabKey) onActiveTabChange(nextTabKey);
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
            onClick={() => onActiveTabChange(tab.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onActiveTabChange(tab.id);
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
              onClick={(event) => {
                event.stopPropagation();
                onCloseTab(tab.id);
              }}
            >
              <Codicon icon="codicon-close" size={14} />
            </button>
          </div>
        ))}
      </div>

      <nav aria-label="Breadcrumb" className="editor-breadcrumb">
        {activeTab.path.map((segment, index) => (
          <span
            key={`${index}-${segment}`}
            className="editor-breadcrumb-segment"
          >
            <span>{segment}</span>
            <Codicon icon="codicon-chevron-right" size={14} />
          </span>
        ))}
        <span className="editor-breadcrumb-current">
          <FileIcon filename={activeTab.filename} size={14} />
          {activeTab.filename}
        </span>
      </nav>

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
                className="shrink-0 select-none text-right text-vscode-line-number w-(--gutter-width) pr-[14px]"
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
