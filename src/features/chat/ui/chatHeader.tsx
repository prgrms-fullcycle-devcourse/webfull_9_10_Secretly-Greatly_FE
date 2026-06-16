"use client";

import { Codicon } from "@/shared/ui";

interface ChatHeaderProps {
  /** 위장용 워크스페이스 라벨(전체 채팅 고정). */
  label: string;
  viewMode: "chat" | "history";
  setViewMode: (mode: "chat" | "history") => void;
  status: string;
  connect: () => void;
}

export function ChatHeader({
  label,
  viewMode,
  setViewMode,
  status,
  connect,
}: ChatHeaderProps) {
  const live = status === "joined" || status === "connected";
  const connecting = status === "connecting";

  return (
    <div className="flex items-center shrink-0 px-2.5 py-1.5 border-b border-vscode-border-sidebar gap-2">
      <Codicon
        icon={
          viewMode === "history" ? "codicon-arrow-right" : "codicon-arrow-left"
        }
        size={14}
        className="text-vscode-fg-icon opacity-80 cursor-pointer hover:text-vscode-fg-sidebar transition-transform"
        onClick={() => setViewMode(viewMode === "history" ? "chat" : "history")}
        title={
          viewMode === "history" ? "Return to active chat" : "View chat history"
        }
      />
      <div className="flex items-center gap-1.5 font-mono text-[11px] text-vscode-fg-desc truncate bg-vscode-input px-2 py-0.5 rounded-[4px] border border-vscode-border-input">
        <Codicon icon="codicon-repo" size={12} className="opacity-70" />
        <span>workspace/</span>
        <span className="text-[#3794ff] font-semibold">{label}</span>
      </div>
      <button
        type="button"
        onClick={connect}
        className={`ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] transition-colors shadow-sm ${
          live
            ? "text-(--chart-up) bg-[#1a3d2e]/60 hover:bg-[#1a3d2e] border border-[#2b5a45]"
            : connecting
              ? "text-[#d7ba7d] bg-[#4d3c1a]/60 border border-[#6b5526]"
              : "text-vscode-fg-desc bg-vscode-input border border-vscode-border-input hover:text-vscode-fg-sidebar hover:border-vscode-focus"
        }`}
        title={
          live
            ? "연결됨 (클릭 시 재연결)"
            : connecting
              ? "연결 중"
              : "연결 끊김 (클릭 시 재연결)"
        }
        aria-label="재연결"
      >
        <span className={`text-[8px] ${live ? "animate-pulse" : ""}`}>●</span>
        <span className="text-[10px] font-bold tracking-widest uppercase">
          {live ? "Live" : connecting ? "Sync" : "Offline"}
        </span>
      </button>
    </div>
  );
}
