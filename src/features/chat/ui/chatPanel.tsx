"use client";

import { useEffect, useRef, useState } from "react";
import { Codicon } from "@/shared/ui";
import { GLOBAL_CHAT_LABEL, useChatSocket } from "../model";
import { ChatHeader } from "./chatHeader";
import { ChatHistoryView } from "./chatHistoryView";
import { ChatInput } from "./chatInput";

function formatTime(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 상대 메시지 닉네임을 사용자별 고정 색으로 표시하기 위한 팔레트. */
const NICK_COLORS = [
  "#c586c0",
  "#4ec9b0",
  "#dcdcaa",
  "#9cdcfe",
  "#ce9178",
  "#569cd6",
  "#d7ba7d",
  "#b5cea8",
  "#f48771",
  "#4fc1ff",
];

/** senderId(또는 닉네임) 해시 → 팔레트 색. 같은 사용자는 항상 같은 색. */
function colorForUser(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return NICK_COLORS[h % NICK_COLORS.length];
}

/**
 * 실시간 채팅 패널 — VS Code 의 Claude Code(에이전트) 패널처럼 위장한 전체 채팅.
 * 종목별 채팅은 사용하지 않고 단일 전체 채팅방(GLOBAL_CHAT_ROOM)만 쓴다.
 * 통신/입장/전송/쿨타임/신고는 useChatSocket 이 담당한다.
 * (위젯 agentPanel 이 이 컴포넌트를 렌더한다)
 */
export function ChatPanel() {
  const [viewMode, setViewMode] = useState<"chat" | "history">("chat");
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [agentMode, setAgentMode] = useState("Auto");

  const {
    status,
    messages,
    error,
    notice,
    currentUserId,
    currentNickname,
    isAuthed,
    canSend,
    cooldownRemaining,
    connect,
    sendMessage,
    reportMessage,
    clearFeedback,
  } = useChatSocket();

  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connecting = status === "connecting";
  const cooldownSec = Math.ceil(cooldownRemaining / 1000);

  const handleSend = () => {
    if (!input.trim() || !canSend) return;
    sendMessage(input);
    setInput("");
  };

  const handleCopy = (text: string) => {
    void navigator.clipboard?.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-vscode-sidebar text-vscode-fg-sidebar min-w-0 text-[13px]">
      {/* ── 대화 헤더 (뒤로 + 컨텍스트) ── */}
      <ChatHeader
        label={GLOBAL_CHAT_LABEL}
        viewMode={viewMode}
        setViewMode={setViewMode}
        status={status}
        connect={connect}
      />

      {!isAuthed ? (
        <div className="flex-1 flex flex-col items-center justify-center text-vscode-fg-desc px-6 text-center gap-2">
          <Codicon icon="codicon-copilot" size={28} />
          <p className="text-[13px]">Sign in to start a session.</p>
        </div>
      ) : viewMode === "history" ? (
        <ChatHistoryView setViewMode={setViewMode} />
      ) : (
        <>
          {/* ── 대화(메시지) ── */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-3 py-4 scrollbar-custom animate-in slide-in-from-right-2 fade-in duration-200">
            {messages.length === 0 && (
              <p className="text-[12px] text-vscode-fg-desc mt-2">
                {connecting
                  ? "Connecting to session…"
                  : "세션이 준비되었습니다. 메시지를 입력해보세요."}
              </p>
            )}

            {messages.map((m) => {
              // 시스템 안내 → 에이전트 상태 로그처럼 표시
              if (m.kind === "system") {
                return (
                  <div
                    key={m.localId}
                    className="flex items-start gap-2 font-mono text-[11px] text-vscode-fg-desc"
                  >
                    <span className="select-none text-[#569cd6]">❯</span>
                    <span className="leading-relaxed wrap-break-word">
                      {m.message}
                    </span>
                  </div>
                );
              }

              if (m.isHidden) {
                return (
                  <div
                    key={m.localId}
                    className="flex items-start gap-2 font-mono text-[11px] text-vscode-fg-desc"
                  >
                    <span className="select-none text-[#858585]">⏺</span>
                    <span className="italic leading-relaxed">
                      output suppressed (policy filter)
                    </span>
                  </div>
                );
              }

              const mine = m.senderId != null && m.senderId === currentUserId;

              // 내 메시지 → 사용자가 에이전트에게 입력한 프롬프트처럼 표시
              if (mine) {
                return (
                  <div
                    key={m.localId}
                    className="group flex items-start gap-2.5 font-mono"
                  >
                    <span className="mt-[5px] select-none text-[12px] text-[#569cd6] leading-none">
                      ❯
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-[13px] font-semibold text-[#569cd6]">
                          @{currentNickname ?? "나"}(me)
                        </span>
                        <span className="text-[11px] text-vscode-fg-desc opacity-70 tabular-nums">
                          {formatTime(m.createdAt)}
                        </span>
                      </div>
                      <span className="block text-[13.5px] leading-relaxed text-vscode-fg wrap-break-word">
                        {m.message}
                      </span>
                    </div>
                  </div>
                );
              }

              // 상대 메시지 → 에이전트 응답(어시스턴트 턴)처럼 표시.
              // 사용자별로 고정 색을 부여해 누가 말했는지 구분되게 한다.
              const nickColor = colorForUser(
                m.senderId ?? m.nickname ?? String(m.chatId ?? ""),
              );
              return (
                <div key={m.localId} className="group flex items-start gap-2.5">
                  <span
                    className="mt-[5px] select-none text-[10px] leading-none"
                    style={{ color: nickColor }}
                  >
                    ⏺
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 font-mono mb-0.5">
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: nickColor }}
                      >
                        @{m.nickname ?? "agent"}
                      </span>
                      <span className="text-[11px] text-vscode-fg-desc opacity-70 tabular-nums">
                        {formatTime(m.createdAt)}
                      </span>
                    </div>
                    <div className="text-[13px] leading-relaxed text-vscode-fg wrap-break-word">
                      {m.message}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-0.5 text-vscode-fg-icon opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleCopy(m.message)}
                      className="hover:text-vscode-fg-sidebar p-0.5"
                      aria-label="Copy"
                      title="Copy code"
                    >
                      <Codicon icon="codicon-copy" size={11} />
                    </button>
                    {m.chatId != null && (
                      <button
                        type="button"
                        onClick={() => reportMessage(m.chatId as number)}
                        className="hover:text-(--vscode-errorForeground) p-0.5"
                        aria-label="Report Output"
                        title="Report Output"
                      >
                        <Codicon icon="codicon-flag" size={11} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* ── 피드백 ── */}
          {(error || notice) && (
            <div className="shrink-0 px-3 pb-1.5 flex items-center justify-between gap-2 text-[12px]">
              <span
                className={
                  error
                    ? "text-(--vscode-errorForeground)"
                    : "text-(--chart-up)"
                }
              >
                {error ?? notice}
              </span>
              <button
                type="button"
                onClick={clearFeedback}
                className="text-vscode-fg-desc hover:text-vscode-fg-sidebar shrink-0"
                aria-label="알림 닫기"
              >
                <Codicon icon="codicon-close" size={12} />
              </button>
            </div>
          )}

          {/* ── 입력 박스 ── */}
          <ChatInput
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            canSend={canSend}
            cooldownSec={cooldownSec}
            modeDropdownOpen={modeDropdownOpen}
            setModeDropdownOpen={setModeDropdownOpen}
            agentMode={agentMode}
            setAgentMode={setAgentMode}
          />
        </>
      )}
    </div>
  );
}
