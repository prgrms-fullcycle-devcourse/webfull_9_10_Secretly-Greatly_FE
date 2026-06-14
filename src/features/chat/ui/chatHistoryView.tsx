"use client";

import { Codicon } from "@/shared/ui";

interface ChatHistoryViewProps {
  setViewMode: (mode: "chat" | "history") => void;
}

export function ChatHistoryView({ setViewMode }: ChatHistoryViewProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-vscode-sidebar text-vscode-fg-sidebar px-4 py-4 scrollbar-custom animate-in slide-in-from-left-2 fade-in duration-200">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-vscode-fg-desc mb-4 flex items-center gap-2">
        <Codicon icon="codicon-history" size={13} /> Recent Sessions
      </h3>

      <div className="mb-5">
        <div className="text-[10px] text-vscode-fg-desc mb-1 border-b border-[#333333] pb-1">
          Today
        </div>
        <button
          onClick={() => setViewMode("chat")}
          className="w-full flex flex-col gap-0.5 text-left py-2.5 px-2 hover:bg-[#2a2d2e] rounded-[4px] group transition-colors"
        >
          <span className="text-[12px] font-medium text-vscode-fg-sidebar group-hover:text-white flex items-center gap-2">
            <Codicon
              icon="codicon-comment-discussion"
              size={12}
              className="text-[#3794ff]"
            />{" "}
            Implement OAuth2 Refresh Token
          </span>
          <span className="text-[10px] text-vscode-fg-desc pl-5">
            2 hours ago
          </span>
        </button>
        <button
          onClick={() => setViewMode("chat")}
          className="w-full flex flex-col gap-0.5 text-left py-2.5 px-2 hover:bg-[#2a2d2e] rounded-[4px] group transition-colors"
        >
          <span className="text-[12px] font-medium text-vscode-fg-sidebar group-hover:text-white flex items-center gap-2">
            <Codicon
              icon="codicon-comment-discussion"
              size={12}
              className="text-vscode-fg-icon"
            />{" "}
            Workspace analysis
          </span>
          <span className="text-[10px] text-vscode-fg-desc pl-5">
            5 hours ago
          </span>
        </button>
      </div>

      <div>
        <div className="text-[10px] text-vscode-fg-desc mb-1 border-b border-[#333333] pb-1">
          Yesterday
        </div>
        <button
          onClick={() => setViewMode("chat")}
          className="w-full flex flex-col gap-0.5 text-left py-2.5 px-2 hover:bg-[#2a2d2e] rounded-[4px] group opacity-80 hover:opacity-100 transition-colors"
        >
          <span className="text-[12px] font-medium text-vscode-fg-sidebar group-hover:text-white flex items-center gap-2">
            <Codicon
              icon="codicon-comment-discussion"
              size={12}
              className="text-vscode-fg-icon"
            />{" "}
            Fix JWT validation bug
          </span>
          <span className="text-[10px] text-vscode-fg-desc pl-5">
            Yesterday, 14:30
          </span>
        </button>
        <button
          onClick={() => setViewMode("chat")}
          className="w-full flex flex-col gap-0.5 text-left py-2.5 px-2 hover:bg-[#2a2d2e] rounded-[4px] group opacity-80 hover:opacity-100 transition-colors"
        >
          <span className="text-[12px] font-medium text-vscode-fg-sidebar group-hover:text-white flex items-center gap-2">
            <Codicon
              icon="codicon-comment-discussion"
              size={12}
              className="text-vscode-fg-icon"
            />{" "}
            Refactoring database models
          </span>
          <span className="text-[10px] text-vscode-fg-desc pl-5">
            Yesterday, 09:15
          </span>
        </button>
      </div>
    </div>
  );
}
