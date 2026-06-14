"use client";

import { useState } from "react";
import { ChatPanel } from "@/features/chat";
import { Codicon } from "@/shared/ui";
import { FakeClaudeCodeView } from "./fakeClaudeCodeView";
import { AgentHeader } from "./agentHeader";
import { AgentFooter } from "./agentFooter";

export interface AgentPanelProps {
  onClose?: () => void;
  onExpand?: () => void;
  isExpanded?: boolean;
}

export function AgentPanel({
  onClose,
  onExpand,
  isExpanded,
}: AgentPanelProps = {}) {
  const [activeTab, setActiveTab] = useState<"CHAT" | "CLAUDE">("CHAT");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-vscode-sidebar text-vscode-fg-sidebar min-w-0 text-[13px] relative">
      <AgentHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExpand={onExpand}
        isExpanded={isExpanded}
        onClose={onClose}
        showToast={showToast}
      />

      {/* ── 메인 영역 ── */}
      <div className="flex-1 min-h-0 flex flex-col z-0">
        {activeTab === "CHAT" && <ChatPanel />}
        {activeTab === "CLAUDE" && <FakeClaudeCodeView />}
      </div>

      <AgentFooter />

      {/* ── Fake VSCode Notification Toast ── */}
      {toastMsg && (
        <div className="absolute bottom-10 right-4 bg-[#252526] border border-[#454545] text-[#cccccc] px-3 py-2 text-[12px] rounded flex items-center gap-2 z-[60] shadow-[0_4px_12px_rgba(0,0,0,0.5)] pointer-events-none animate-in slide-in-from-bottom-2 fade-in duration-200">
          <Codicon icon="codicon-info" className="text-[#3794ff]" size={14} />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
