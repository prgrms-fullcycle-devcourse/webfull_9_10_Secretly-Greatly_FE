"use client";

import { Codicon, FileIcon } from "@/shared/ui";
import { QUICK_ACTIONS, RECENT_FILES } from "../model/mockData";

/* ── Shortcut Badge ────────────────────────────────────── */
function Shortcut({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {keys.map((k, i) => (
        <span key={i} className="flex items-center gap-0.5">
          <kbd className="kbd-shortcut">{k}</kbd>
          {i < keys.length - 1 && (
            <span
              className="text-vscode-fg-desc text-[11px]"
              aria-hidden="true"
            >
              +
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/* ── QuickOpen ─────────────────────────────────────────── */
export interface QuickOpenProps {
  query: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
}

export function QuickOpen({
  query,
  activeIndex,
  onActiveIndexChange,
  onClose,
}: QuickOpenProps) {
  const showDefault = query === "";

  const filteredRecent = showDefault
    ? RECENT_FILES
    : RECENT_FILES.filter(
        (f) =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          f.path.toLowerCase().includes(query.toLowerCase()),
      );

  return (
    <ul
      id="quickopen-listbox"
      role="listbox"
      aria-label="Quick Open results"
      className="fixed max-h-[400px] overflow-auto top-(--titlebar-height) left-1/2 -translate-x-1/2
                 w-[min(680px,calc(100vw-32px))] bg-vscode-quick-input
                 border border-vscode-border-widget border-t-0
                 rounded-b-sm shadow-(--shadow-overlay)
                 z-(--z-command-palette) list-none p-0 m-0"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Default actions */}
      {showDefault &&
        QUICK_ACTIONS.map((action, i) => {
          const active = i === activeIndex;
          return (
            <li key={action.label} role="none">
              <button
                type="button"
                role="option"
                id={`quickopen-item-${i}`}
                aria-selected={active}
                onMouseEnter={() => onActiveIndexChange(i)}
                onClick={onClose}
                className={`w-full flex items-center cursor-pointer h-[22px] px-5 gap-2 text-[13px] border-0 text-left ${
                  active
                    ? "bg-vscode-list-active text-white"
                    : "bg-transparent text-vscode-fg"
                }`}
              >
                <Codicon
                  icon={action.icon}
                  size={14}
                  className="shrink-0 opacity-70"
                />
                <span className="flex-1">{action.label}</span>
                {action.suffix && (
                  <span
                    className={`text-[12px] ${active ? "text-white/65" : "text-vscode-fg-desc"}`}
                  >
                    {action.suffix}
                  </span>
                )}
                {action.shortcut && <Shortcut keys={action.shortcut} />}
              </button>
            </li>
          );
        })}

      {/* Separator */}
      {showDefault && filteredRecent.length > 0 && (
        <li role="separator" className="h-px bg-vscode-border-widget" />
      )}

      {/* Recent files */}
      {filteredRecent.map((file, i) => {
        const idx = showDefault ? QUICK_ACTIONS.length + i : i;
        const active = idx === activeIndex;
        return (
          <li key={file.name + file.path} role="none">
            <button
              type="button"
              role="option"
              id={`quickopen-item-${idx}`}
              aria-selected={active}
              onMouseEnter={() => onActiveIndexChange(idx)}
              onClick={onClose}
              className={`w-full flex items-center cursor-pointer h-[22px] px-5 gap-[6px] text-[13px] border-0 text-left ${
                active
                  ? "bg-vscode-list-active text-white"
                  : "bg-transparent text-vscode-fg"
              }`}
            >
              <FileIcon
                filename={file.filename}
                size={14}
                color={file.iconColor}
              />
              <span className="font-medium whitespace-nowrap">{file.name}</span>
              <span
                className={`overflow-hidden truncate flex-1 whitespace-nowrap text-[12px] ${active ? "text-white/60" : "text-vscode-fg-desc"}`}
              >
                {file.path}
              </span>
              {file.tag && (
                <span
                  className={`shrink-0 text-[12px] ${active ? "text-white/50" : "text-vscode-fg-desc"}`}
                >
                  {file.tag}
                </span>
              )}
            </button>
          </li>
        );
      })}

      {!showDefault && filteredRecent.length === 0 && (
        <li className="text-vscode-fg-desc px-4 py-3 text-[13px]" role="none">
          No results for &quot;{query}&quot;
        </li>
      )}
    </ul>
  );
}
