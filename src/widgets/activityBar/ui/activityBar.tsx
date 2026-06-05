"use client";

import { Codicon } from "@/shared/ui";

const TOP_ITEMS = [
  { id: "explorer", icon: "codicon-files", label: "Explorer (Ctrl+Shift+E)" },
  { id: "search", icon: "codicon-search", label: "Search (Ctrl+Shift+F)" },
  {
    id: "scm",
    icon: "codicon-source-control",
    label: "Source Control (Ctrl+Shift+G)",
  },
  { id: "run", icon: "codicon-run", label: "Run and Debug (Ctrl+Shift+D)" },
  {
    id: "extensions",
    icon: "codicon-extensions",
    label: "Extensions (Ctrl+Shift+X)",
  },
];

const BOTTOM_ITEMS = [
  { id: "account", icon: "codicon-account", label: "Account" },
  { id: "settings", icon: "codicon-settings-gear", label: "Settings" },
];

interface Props {
  activeView: string | null;
  onViewChange: (id: string) => void;
}

export function ActivityBar({ activeView, onViewChange }: Props) {
  return (
    <aside
      aria-label="Activity Bar"
      className="flex flex-col items-center shrink-0 w-(--activitybar-width) bg-vscode-activitybar border-r border-vscode-border-activity z-(--z-sidebar)"
    >
      <div className="flex-1 flex flex-col">
        {TOP_ITEMS.map(({ id, icon, label }) => (
          <button
            key={id}
            className="activity-bar-btn"
            data-active={activeView === id}
            aria-pressed={activeView === id}
            title={label}
            aria-label={label}
            onClick={() => onViewChange(id)}
          >
            <Codicon icon={icon} size={24} />
          </button>
        ))}
      </div>

      <div className="flex flex-col">
        {BOTTOM_ITEMS.map(({ id, icon, label }) => (
          <button
            key={id}
            className="activity-bar-btn"
            data-active={activeView === id}
            aria-pressed={activeView === id}
            title={label}
            aria-label={label}
            onClick={() => onViewChange(id)}
          >
            <Codicon icon={icon} size={24} />
          </button>
        ))}
      </div>
    </aside>
  );
}
