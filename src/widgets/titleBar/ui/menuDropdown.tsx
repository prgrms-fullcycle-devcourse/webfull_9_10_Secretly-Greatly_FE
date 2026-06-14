"use client";

import { Codicon } from "@/shared/ui";
import type { MenuItem } from "../model/menuData";

export function MenuDropdown({
  menuName,
  items,
  anchorRect,
  onClose,
}: {
  menuName: string;
  items: MenuItem[];
  anchorRect: DOMRect;
  onClose: () => void;
}) {
  return (
    <ul
      role="menu"
      aria-label={menuName}
      className="fixed overflow-hidden list-none p-0 m-0 bg-vscode-menu border border-vscode-border-menu
                 rounded-sm shadow-(--shadow-overlay)
                 z-(--z-dropdown) min-w-[240px] py-1"
      style={{ top: anchorRect.bottom, left: anchorRect.left }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => {
        if (item.type === "separator") {
          return (
            <li
              key={index}
              role="separator"
              className="h-px bg-(--vscode-menu-separatorBackground) my-1 mx-2"
            />
          );
        }
        return (
          <li key={index} role="none">
            <button
              type="button"
              role="menuitem"
              disabled={item.type === "item" && item.disabled}
              onClick={onClose}
              className="menu-item w-full h-6 flex items-center justify-between gap-8 border-0 cursor-default text-left"
            >
              <span>{item.label}</span>
              {item.type === "item" && item.shortcut && (
                <span className="whitespace-nowrap text-vscode-fg-desc text-(length:--font-size-md)">
                  {item.shortcut}
                </span>
              )}
              {item.type === "submenu" && (
                <Codicon
                  icon="codicon-chevron-right"
                  size={14}
                  className="text-vscode-fg-desc"
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
