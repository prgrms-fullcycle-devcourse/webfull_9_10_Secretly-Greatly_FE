"use client";

import { useState } from "react";
import { Codicon, FileIcon } from "@/shared/ui";

export interface TreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: TreeNode[];
}

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  selectedKey: string | null;
  onSelect: (id: string) => void;
}

function TreeItem({ node, depth, selectedKey, onSelect }: TreeItemProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isSelected = selectedKey === node.id;
  const isFolder = node.type === "folder";

  const handleClick = () => {
    onSelect(node.id);
    if (isFolder) setExpanded((prev) => !prev);
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
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        {/* twistie */}
        <span className="tree-twistie">
          {isFolder && (
            <Codicon
              icon={expanded ? "codicon-chevron-down" : "codicon-chevron-right"}
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

        <span className="tree-label">{node.name}</span>
      </button>

      {isFolder &&
        expanded &&
        node.children?.map((child) => (
          <TreeItem
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedKey={selectedKey}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

interface TreeViewProps {
  nodes: TreeNode[];
  label?: string;
}

export function TreeView({ nodes, label = "Explorer" }: TreeViewProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  return (
    <div role="tree" aria-label={label} className="overflow-auto flex-1">
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
        />
      ))}
    </div>
  );
}
