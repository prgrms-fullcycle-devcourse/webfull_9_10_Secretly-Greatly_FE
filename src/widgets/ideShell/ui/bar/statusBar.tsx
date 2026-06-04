"use client";

import { Codicon } from "@/shared/ui";

interface StatusBarProps {
  /** 종 클릭 핸들러 (알림 센터 토글) */
  onBellClick?: () => void;
  /** 알림 센터 열림 여부 — 종 아이콘 표시용 */
  notificationsActive?: boolean;
}

export function StatusBar({
  onBellClick,
  notificationsActive = false,
}: StatusBarProps = {}) {
  return (
    <footer
      className="shrink-0 flex items-center justify-between select-none overflow-hidden
                 h-(--statusbar-height) bg-vscode-statusbar border-t border-vscode-border-statusbar
                 text-vscode-fg-statusbar z-(--z-statusbar)"
    >
      {/* Left */}
      <div className="flex items-center h-full">
        <button title="Open a Remote Window" className="statusbar-remote">
          <Codicon icon="codicon-remote" size={14} />
        </button>
        <button className="statusbar-item" title="main — checkout branch">
          <Codicon icon="codicon-git-branch" size={14} />
          <span>main</span>
        </button>
        <button className="statusbar-item" title="No problems">
          <Codicon icon="codicon-error" size={12} />
          <span>0</span>
        </button>
        <button className="statusbar-item" title="No warnings">
          <Codicon icon="codicon-warning" size={12} />
          <span>0</span>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center h-full">
        <button className="statusbar-item" title="Go to Line/Column">
          Ln 1, Col 1
        </button>
        <button className="statusbar-item" title="Select Indentation">
          Spaces: 2
        </button>
        <button className="statusbar-item" title="Select Encoding">
          UTF-8
        </button>
        <button className="statusbar-item" title="Select End of Line Sequence">
          LF
        </button>
        <button className="statusbar-item" title="Change Language Mode">
          TypeScript React
        </button>
        <button
          className="statusbar-item statusbar-item-icon"
          title="Notifications"
          aria-label="Notifications"
          aria-pressed={notificationsActive}
          onClick={onBellClick}
        >
          <Codicon icon="codicon-bell" size={14} />
        </button>
      </div>
    </footer>
  );
}
