"use client";

import { useMemo, useState } from "react";
import { AuthPanel } from "@/features/auth";
import { useFavoritesStore } from "@/features/favorites";
import { Codicon, IconButton } from "@/shared/ui";
import type { TreeFileOpenPayload, TreeNode } from "./treeView";
import { TreeView } from "./treeView";
import { SearchView } from "./searchView";
import { EXPLORER_TREE } from "../model/mockData";

/** EXPLORER_TREE 의 watchlist 폴더 자식을 즐겨찾기 스토어로 채운다 (id = 종목 코드). */
function injectFavorites(
  nodes: TreeNode[],
  favorites: { code: string; name: string }[],
): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === "watchlist") {
      return {
        ...node,
        children: favorites.map((f) => ({
          id: f.code,
          name: f.name,
          type: "file" as const,
          favorite: true,
        })),
      };
    }
    if (node.children) {
      return { ...node, children: injectFavorites(node.children, favorites) };
    }
    return node;
  });
}

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
      className={`section-header h-[22px] flex items-center shrink-0${topBorder ? " border-t border-vscode-border-sidebar" : ""}`}
    >
      {/* toggle button spans full width minus the action icons */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex h-full flex-1 items-center gap-0.5 min-w-0 border-0 bg-transparent py-0 pl-1 pr-2 cursor-pointer select-none text-left"
      >
        <Codicon
          icon={expanded ? "codicon-chevron-down" : "codicon-chevron-right"}
          size={16}
          className="shrink-0 text-vscode-fg-icon"
        />
        <span className="min-w-0 overflow-hidden truncate whitespace-nowrap uppercase font-bold tracking-[0.04em] text-vscode-fg-sidebar text-(length:--font-size-sm)">
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

function ExplorerView({
  onFileOpen,
}: {
  onFileOpen?: (file: TreeFileOpenPayload) => void;
}) {
  const [folderOpen, setFolderOpen] = useState(true);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const favorites = useFavoritesStore((s) => s.items);
  const removeFavorite = useFavoritesStore((s) => s.remove);
  const tree = useMemo(
    () => injectFavorites(EXPLORER_TREE, favorites),
    [favorites],
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        label="Secretly_Greatly"
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
        <TreeView
          nodes={tree}
          label="Explorer file tree"
          onFileOpen={onFileOpen}
          onFavoriteRemove={removeFavorite}
        />
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
  width: number;
  onFileOpen?: (file: TreeFileOpenPayload) => void;
  /** 로그인 성공 시 호출 (예: EXPLORER 뷰로 전환). */
  onAuthSuccess?: () => void;
}

function renderContent(
  view: string,
  onFileOpen?: (file: TreeFileOpenPayload) => void,
  onAuthSuccess?: () => void,
) {
  if (view === "explorer") return <ExplorerView onFileOpen={onFileOpen} />;
  if (view === "search") return <SearchView />;
  if (view === "account") return <AuthPanel onSuccess={onAuthSuccess} />;
  return (
    <div className="flex-1 flex items-center justify-center text-vscode-fg-desc text-(length:--font-size-md)">
      {STUB_VIEWS[view] ?? view}
    </div>
  );
}

export function Sidebar({ view, width, onFileOpen, onAuthSuccess }: Props) {
  if (!view) return null;

  const title = view === "explorer" ? "Explorer" : (STUB_VIEWS[view] ?? view);

  return (
    <aside
      aria-label={title}
      className="shrink-0 overflow-hidden flex flex-col bg-vscode-sidebar text-vscode-fg-sidebar w-(--sidebar-width) border-r border-vscode-border-sidebar z-(--z-sidebar)"
      style={{ width }}
    >
      {/* View Title — search has its own header */}
      {view !== "search" && (
        <div className="sidebar-view-title">
          <span className="sidebar-view-title-label">{title}</span>
          <IconButton
            variant="panel"
            icon="codicon-ellipsis"
            label="Views and More Actions"
            iconSize={16}
          />
        </div>
      )}

      {renderContent(view, onFileOpen, onAuthSuccess)}
    </aside>
  );
}
