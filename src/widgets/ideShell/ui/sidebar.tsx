"use client";

import { useState } from "react";
import { Codicon, IconButton } from "@/shared/ui";
import { TreeView } from "./treeView";
import { SearchView } from "./searchView";
import { EXPLORER_TREE } from "./mockData";

const STUB_VIEWS: Record<string, string> = {
  scm: "Source Control",
  run: "Run and Debug",
  extensions: "Extensions",
  account: "Account",
  settings: "Settings",
};

interface SectionAction {
  icon: string;
  title: string;
}

function SectionHeader({
  label,
  expanded,
  onToggle,
  actions,
  topBorder = false,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  actions?: SectionAction[];
  topBorder?: boolean;
}) {
  return (
    <div
      className={`section-header h-[22px] flex items-center px-2 gap-0.5 shrink-0${topBorder ? " border-t border-vscode-border-sidebar" : ""}`}
    >
      {/* toggle button spans full width minus the action icons */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex flex-1 items-center gap-0.5 min-w-0 border-0 bg-transparent p-0 cursor-pointer select-none"
      >
        <Codicon
          icon={expanded ? "codicon-chevron-down" : "codicon-chevron-right"}
          size={16}
          className="shrink-0 text-vscode-fg-icon"
        />
        <span className="uppercase font-bold tracking-[0.04em] flex-1 overflow-hidden truncate whitespace-nowrap text-vscode-fg-sidebar text-[length:var(--font-size-sm)]">
          {label}
        </span>
      </button>

      {actions && (
        <span className="section-actions flex gap-1 shrink-0">
          {actions.map((a) => (
            <IconButton
              key={a.icon}
              variant="panel"
              icon={a.icon}
              label={a.title}
              iconSize={16}
            />
          ))}
        </span>
      )}
    </div>
  );
}

function ExplorerView() {
  const [folderOpen, setFolderOpen] = useState(true);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        label="webfull_9_10_Secretly-Greatly_FE"
        expanded={folderOpen}
        onToggle={() => setFolderOpen((v) => !v)}
        actions={[
          { icon: "codicon-new-file", title: "New File…" },
          { icon: "codicon-new-folder", title: "New Folder…" },
          { icon: "codicon-refresh", title: "Refresh Explorer" },
          {
            icon: "codicon-collapse-all",
            title: "Collapse Folders in Explorer",
          },
        ]}
      />
      {folderOpen && (
        <TreeView nodes={EXPLORER_TREE} label="Explorer file tree" />
      )}

      <SectionHeader
        label="Outline"
        expanded={outlineOpen}
        onToggle={() => setOutlineOpen((v) => !v)}
        topBorder
      />
      <SectionHeader
        label="Timeline"
        expanded={timelineOpen}
        onToggle={() => setTimelineOpen((v) => !v)}
        topBorder
      />
    </div>
  );
}

interface Props {
  view: string | null;
}

function renderContent(view: string) {
  if (view === "explorer") return <ExplorerView />;
  if (view === "search") return <SearchView />;
  return (
    <div className="flex-1 flex items-center justify-center text-vscode-fg-desc text-[length:var(--font-size-md)]">
      {STUB_VIEWS[view] ?? view}
    </div>
  );
}

export function Sidebar({ view }: Props) {
  if (!view) return null;

  const title = view === "explorer" ? "Explorer" : (STUB_VIEWS[view] ?? view);

  return (
    <aside
      aria-label={title}
      className="shrink-0 overflow-hidden flex flex-col bg-vscode-sidebar text-vscode-fg-sidebar w-[var(--sidebar-width)] border-r border-vscode-border-sidebar z-[var(--z-sidebar)]"
    >
      {/* View Title — search has its own header */}
      {view !== "search" && (
        <div className="h-[35px] flex items-center justify-between shrink-0 select-none px-5 text-[length:var(--font-size-sm)] font-normal">
          <span className="uppercase tracking-[0.04em] text-vscode-fg-sidebar">
            {title}
          </span>
          <IconButton
            variant="panel"
            icon="codicon-ellipsis"
            label="Views and More Actions…"
            iconSize={16}
          />
        </div>
      )}

      {renderContent(view)}
    </aside>
  );
}
