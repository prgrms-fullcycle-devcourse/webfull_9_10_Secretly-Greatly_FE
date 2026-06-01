"use client";

import { useEffect, useRef, useState } from "react";
import { Codicon, IconButton, VscodeIcon } from "@/shared/ui";
import { QuickOpen } from "./quickOpen";
import { QUICK_ACTIONS, RECENT_FILES } from "./mockData";

type MenuItem =
  | { type: "item"; label: string; shortcut?: string; disabled?: boolean }
  | { type: "separator" }
  | { type: "submenu"; label: string };

const MENUS: Record<string, MenuItem[]> = {
  File: [
    { type: "item", label: "New Text File", shortcut: "Ctrl+N" },
    { type: "item", label: "New Window", shortcut: "Ctrl+Shift+N" },
    { type: "separator" },
    { type: "item", label: "Open File...", shortcut: "Ctrl+O" },
    { type: "item", label: "Open Folder...", shortcut: "Ctrl+K Ctrl+O" },
    { type: "submenu", label: "Open Recent" },
    { type: "separator" },
    { type: "item", label: "Save", shortcut: "Ctrl+S" },
    { type: "item", label: "Save As...", shortcut: "Ctrl+Shift+S" },
    { type: "item", label: "Save All", shortcut: "Ctrl+K S" },
    { type: "separator" },
    { type: "item", label: "Close Editor", shortcut: "Ctrl+W" },
    { type: "item", label: "Close Folder" },
    { type: "separator" },
    { type: "item", label: "Exit" },
  ],
  Edit: [
    { type: "item", label: "Undo", shortcut: "Ctrl+Z" },
    { type: "item", label: "Redo", shortcut: "Ctrl+Y" },
    { type: "separator" },
    { type: "item", label: "Cut", shortcut: "Ctrl+X" },
    { type: "item", label: "Copy", shortcut: "Ctrl+C" },
    { type: "item", label: "Paste", shortcut: "Ctrl+V" },
    { type: "separator" },
    { type: "item", label: "Find", shortcut: "Ctrl+F" },
    { type: "item", label: "Replace", shortcut: "Ctrl+H" },
    { type: "item", label: "Find in Files", shortcut: "Ctrl+Shift+F" },
    { type: "item", label: "Replace in Files", shortcut: "Ctrl+Shift+H" },
  ],
  Selection: [
    { type: "item", label: "Select All", shortcut: "Ctrl+A" },
    { type: "item", label: "Expand Selection", shortcut: "Shift+Alt+Right" },
    { type: "item", label: "Shrink Selection", shortcut: "Shift+Alt+Left" },
    { type: "separator" },
    { type: "item", label: "Copy Line Up", shortcut: "Shift+Alt+Up" },
    { type: "item", label: "Copy Line Down", shortcut: "Shift+Alt+Down" },
    { type: "item", label: "Move Line Up", shortcut: "Alt+Up" },
    { type: "item", label: "Move Line Down", shortcut: "Alt+Down" },
  ],
  View: [
    { type: "item", label: "Command Palette...", shortcut: "Ctrl+Shift+P" },
    { type: "item", label: "Open View..." },
    { type: "separator" },
    { type: "submenu", label: "Appearance" },
    { type: "submenu", label: "Editor Layout" },
    { type: "separator" },
    { type: "item", label: "Explorer", shortcut: "Ctrl+Shift+E" },
    { type: "item", label: "Search", shortcut: "Ctrl+Shift+F" },
    { type: "item", label: "Source Control", shortcut: "Ctrl+Shift+G" },
    { type: "item", label: "Run", shortcut: "Ctrl+Shift+D" },
    { type: "item", label: "Extensions", shortcut: "Ctrl+Shift+X" },
    { type: "separator" },
    { type: "item", label: "Terminal", shortcut: "Ctrl+`" },
    { type: "item", label: "Problems", shortcut: "Ctrl+Shift+M" },
    { type: "item", label: "Output", shortcut: "Ctrl+Shift+U" },
    { type: "separator" },
    { type: "item", label: "Word Wrap", shortcut: "Alt+Z" },
  ],
  Go: [
    { type: "item", label: "Back", shortcut: "Alt+Left" },
    { type: "item", label: "Forward", shortcut: "Alt+Right" },
    { type: "separator" },
    { type: "item", label: "Go to File...", shortcut: "Ctrl+P" },
    { type: "item", label: "Go to Symbol in Workspace...", shortcut: "Ctrl+T" },
    { type: "item", label: "Go to Definition", shortcut: "F12" },
    { type: "separator" },
    { type: "item", label: "Go to Line/Column...", shortcut: "Ctrl+G" },
  ],
  Run: [
    { type: "item", label: "Start Debugging", shortcut: "F5" },
    { type: "item", label: "Run Without Debugging", shortcut: "Ctrl+F5" },
    { type: "item", label: "Stop Debugging", shortcut: "Shift+F5" },
    { type: "item", label: "Restart Debugging", shortcut: "Ctrl+Shift+F5" },
    { type: "separator" },
    { type: "item", label: "Open Configurations" },
    { type: "item", label: "Add Configuration..." },
  ],
  Terminal: [
    { type: "item", label: "New Terminal", shortcut: "Ctrl+`" },
    { type: "item", label: "Split Terminal", shortcut: "Ctrl+Shift+5" },
    { type: "separator" },
    { type: "item", label: "Run Task..." },
    { type: "item", label: "Run Build Task...", shortcut: "Ctrl+Shift+B" },
    { type: "item", label: "Run Active File" },
    { type: "separator" },
    { type: "item", label: "Show Running Tasks..." },
    { type: "item", label: "Terminate Task..." },
  ],
  Help: [
    { type: "item", label: "Welcome" },
    { type: "item", label: "Show All Commands", shortcut: "Ctrl+Shift+P" },
    { type: "item", label: "Documentation" },
    { type: "separator" },
    {
      type: "item",
      label: "Keyboard Shortcuts Reference",
      shortcut: "Ctrl+K Ctrl+R",
    },
    { type: "separator" },
    { type: "item", label: "Report Issue" },
    { type: "separator" },
    { type: "item", label: "About" },
  ],
};

/* ── Menu Dropdown ── */
function MenuDropdown({
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
                 rounded-[var(--radius-sm)] shadow-[var(--shadow-overlay)]
                 z-[var(--z-dropdown)] min-w-[240px] py-1"
      style={{ top: anchorRect.bottom, left: anchorRect.left }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => {
        if (item.type === "separator") {
          return (
            <li
              key={index}
              role="separator"
              className="h-px bg-[var(--vscode-menu-separatorBackground)] my-1 mx-2"
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
                <span className="whitespace-nowrap text-vscode-fg-desc text-[length:var(--font-size-md)]">
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

/* ── TitleBar ── */
export function TitleBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [cmdActive, setCmdActive] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [quickOpenIndex, setQuickOpenIndex] = useState(0);
  const cmdInputRef = useRef<HTMLInputElement>(null);
  const cmdPillRef = useRef<HTMLDivElement>(null);

  const openCmd = () => {
    setCmdActive(true);
    setQuickOpenIndex(0);
    // use flushSync alternative — defer focus after React re-renders
    requestAnimationFrame(() => cmdInputRef.current?.focus());
  };
  const closeCmd = () => {
    setCmdActive(false);
    setCmdQuery("");
    setQuickOpenIndex(0);
  };

  /* Escape closes quick-open */
  useEffect(() => {
    if (!cmdActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCmd();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [cmdActive]);

  /* Click outside closes quick-open */
  useEffect(() => {
    if (!cmdActive) return;
    const handler = (e: MouseEvent) => {
      if (!cmdPillRef.current?.contains(e.target as Node)) closeCmd();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cmdActive]);

  /* Click outside closes menu — skip if click is on a menu trigger button */
  useEffect(() => {
    if (!activeMenu) return;
    const handler = (e: MouseEvent) => {
      if ((e.target as Element).closest("[data-menu-trigger]")) return;
      setActiveMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activeMenu]);

  const handleMenuClick = (
    name: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (activeMenu === name) {
      setActiveMenu(null);
      return;
    }
    setAnchorRect(e.currentTarget.getBoundingClientRect());
    setActiveMenu(name);
  };

  /* Quick-open keyboard navigation */
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
    <>
      <header
        className="shrink-0 select-none relative
                   h-[var(--titlebar-height)] bg-vscode-titlebar text-vscode-fg-titlebar
                   text-[length:var(--font-size-md)] z-[var(--z-titlebar)]
                   grid grid-cols-[auto_minmax(260px,1fr)_auto] items-center
                   border-b border-vscode-border-titlebar"
      >
        {/* Left: logo + menu */}
        <div className="flex items-center h-full min-w-0">
          <div className="w-[34px] h-full flex items-center justify-center shrink-0">
            <VscodeIcon size={17} />
          </div>
          <nav
            className="flex items-center h-full"
            aria-label="Application menu"
          >
            {Object.keys(MENUS).map((name) => (
              <button
                key={name}
                type="button"
                data-menu-trigger
                aria-haspopup="menu"
                aria-expanded={activeMenu === name}
                onClick={(e) => handleMenuClick(name, e)}
                data-active={activeMenu === name}
                className="menu-bar-btn relative h-full border-0"
                onMouseEnter={(e) => {
                  if (activeMenu && activeMenu !== name) {
                    setAnchorRect(e.currentTarget.getBoundingClientRect());
                    setActiveMenu(name);
                  }
                }}
              >
                {name}
              </button>
            ))}
          </nav>
        </div>

        {/* Center: nav + command center */}
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
                <span className="flex-1 text-[12px] opacity-[0.86]">
                  screet
                </span>
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

        {/* Right: layout icons + window controls */}
        <div className="flex items-center h-full justify-self-end">
          <div className="flex items-center gap-0">
            {[
              {
                icon: "codicon-layout-sidebar-left",
                label: "Toggle Primary Side Bar (Ctrl+B)",
              },
              { icon: "codicon-layout-panel", label: "Toggle Panel (Ctrl+J)" },
              {
                icon: "codicon-layout-sidebar-right",
                label: "Toggle Secondary Side Bar (Ctrl+Alt+B)",
              },
              { icon: "codicon-layout-centered", label: "Customize Layout" },
            ].map(({ icon, label }) => (
              <IconButton
                key={label}
                variant="titlebar"
                label={label}
                icon={icon}
              />
            ))}
          </div>

          <IconButton
            variant="window"
            label="Minimize"
            icon="codicon-chrome-minimize"
          />
          <IconButton
            variant="window"
            label="Restore"
            icon="codicon-chrome-restore"
          />
          <IconButton
            variant="window"
            danger
            label="Close"
            icon="codicon-chrome-close"
          />
        </div>
      </header>

      {activeMenu && anchorRect && MENUS[activeMenu] && (
        <MenuDropdown
          menuName={activeMenu}
          items={MENUS[activeMenu]}
          anchorRect={anchorRect}
          onClose={() => setActiveMenu(null)}
        />
      )}
    </>
  );
}
