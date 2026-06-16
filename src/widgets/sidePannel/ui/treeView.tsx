"use client";

import { useState } from "react";
import { Codicon, FileIcon, IconButton } from "@/shared/ui";

export interface TreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: TreeNode[];
  /** 즐겨찾기 항목 — 행 오른쪽에 ★ 표시. */
  favorite?: boolean;
}

export interface TreeFileOpenPayload {
  id: string;
  name: string;
  path: string[];
}

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  path: string[];
  selectedKey: string | null;
  onSelect: (id: string) => void;
  onFileOpen?: (file: TreeFileOpenPayload) => void;
  /** 즐겨찾기(★) 항목에서 별 클릭 시 — node.id(종목 코드)로 해제. */
  onFavoriteRemove?: (code: string) => void;
}

function TreeItem({
  node,
  depth,
  path,
  selectedKey,
  onSelect,
  onFileOpen,
  onFavoriteRemove,
}: TreeItemProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isSelected = selectedKey === node.id;
  const isFolder = node.type === "folder";
  const itemPath = [...path, node.name];

  const handleClick = () => {
    onSelect(node.id);
    if (isFolder) {
      setExpanded((prev) => !prev);
      return;
    }

    onFileOpen?.({
      id: node.id,
      name: node.name,
      path,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        if (isFolder && !expanded) setExpanded(true);
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (isFolder && expanded) setExpanded(false);
        break;
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        const tree = e.currentTarget.closest('[role="tree"]');
        if (!tree) break;
        const items = Array.from(
          tree.querySelectorAll<HTMLElement>('[role="treeitem"]'),
        );
        const idx = items.indexOf(e.currentTarget);
        const next = e.key === "ArrowDown" ? idx + 1 : idx - 1;
        if (next >= 0 && next < items.length) items[next].focus();
        break;
      }
      case "Home": {
        e.preventDefault();
        const tree = e.currentTarget.closest('[role="tree"]');
        const first = tree?.querySelector<HTMLElement>('[role="treeitem"]');
        first?.focus();
        break;
      }
      case "End": {
        e.preventDefault();
        const tree = e.currentTarget.closest('[role="tree"]');
        const all = tree?.querySelectorAll<HTMLElement>('[role="treeitem"]');
        if (all?.length) all[all.length - 1].focus();
        break;
      }
    }
  };

  return (
    <div role="none">
      <div className="relative">
        <button
          type="button"
          role="treeitem"
          aria-expanded={isFolder ? expanded : undefined}
          aria-selected={isSelected}
          aria-level={depth + 1}
          className="tree-item"
          data-folder={isFolder}
          data-selected={isSelected}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          style={{ paddingLeft: 16 + depth * 16 }}
        >
          {/* twistie */}
          <span className="tree-twistie">
            {isFolder && (
              <Codicon
                icon={
                  expanded ? "codicon-chevron-down" : "codicon-chevron-right"
                }
                size={16}
              />
            )}
          </span>

          {/* file icon (folders show no icon) */}
          {!isFolder && (
            <span className="tree-file-icon" aria-hidden="true">
              <FileIcon filename={node.name} size={14} />
            </span>
          )}

          <span className={node.favorite ? "tree-label pr-7" : "tree-label"}>
            {node.name}
          </span>
        </button>

        {node.favorite && (
          <span className="absolute inset-y-0 right-2 flex items-center">
            <IconButton
              variant="search"
              label="즐겨찾기 해제"
              pressed
              onClick={(event) => {
                event.stopPropagation();
                onFavoriteRemove?.(node.id);
              }}
              icon="codicon-star-empty"
              iconSize={13}
              iconClassName="text-yellow-400"
              className="h-4 w-4"
            />
          </span>
        )}
      </div>

      {isFolder &&
        expanded &&
        node.children?.map((child) => (
          <TreeItem
            key={child.id}
            node={child}
            depth={depth + 1}
            path={itemPath}
            selectedKey={selectedKey}
            onSelect={onSelect}
            onFileOpen={onFileOpen}
            onFavoriteRemove={onFavoriteRemove}
          />
        ))}
    </div>
  );
}

interface TreeViewProps {
  nodes: TreeNode[];
  label?: string;
  onFileOpen?: (file: TreeFileOpenPayload) => void;
  onFavoriteRemove?: (code: string) => void;
}

export function TreeView({
  nodes,
  label = "Explorer",
  onFileOpen,
  onFavoriteRemove,
}: TreeViewProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  return (
    <div role="tree" aria-label={label} className="overflow-auto flex-1">
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          path={[]}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
          onFileOpen={onFileOpen}
          onFavoriteRemove={onFavoriteRemove}
        />
      ))}
    </div>
  );
}
