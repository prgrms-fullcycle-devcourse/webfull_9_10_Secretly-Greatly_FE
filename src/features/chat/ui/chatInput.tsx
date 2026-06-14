"use client";

import { Codicon } from "@/shared/ui";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  canSend: boolean;
  cooldownSec: number;
  roomEditing: boolean;
  setRoomEditing: (value: boolean) => void;
  roomInput: string;
  setRoomInput: (value: string) => void;
  room: string;
  commitRoom: () => void;
  modeDropdownOpen: boolean;
  setModeDropdownOpen: (value: boolean) => void;
  agentMode: string;
  setAgentMode: (mode: string) => void;
}

export function ChatInput({
  input,
  setInput,
  handleSend,
  canSend,
  cooldownSec,
  roomEditing,
  setRoomEditing,
  roomInput,
  setRoomInput,
  room,
  commitRoom,
  modeDropdownOpen,
  setModeDropdownOpen,
  agentMode,
  setAgentMode,
}: ChatInputProps) {
  return (
    <div className="shrink-0 px-2 pb-1">
      <div className="rounded-[6px] border border-vscode-border-input bg-vscode-input focus-within:border-vscode-focus">
        <textarea
          className="w-full bg-transparent text-vscode-fg-input px-3 pt-2.5 pb-1 text-[13px] outline-none resize-none min-h-[40px] max-h-[140px] placeholder:text-(--vscode-input-placeholderForeground)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Describe what to build"
          rows={1}
        />

        <div className="flex items-center gap-1 px-1.5 pb-1.5">
          <span className="p-1 text-vscode-fg-icon opacity-80" title="첨부">
            <Codicon icon="codicon-add" size={14} />
          </span>

          {/* 방(종목) 코드 — 컨텍스트 칩 자리 */}
          {roomEditing ? (
            <input
              autoFocus
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              onBlur={commitRoom}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitRoom();
                }
                if (e.key === "Escape") {
                  setRoomInput(room);
                  setRoomEditing(false);
                }
              }}
              className="w-24 bg-[#1e1e1e] text-vscode-fg-input px-1.5 py-0.5 border border-vscode-focus text-[11px] font-mono outline-none rounded-[3px]"
              aria-label="방 종목 코드"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setRoomInput(room);
                setRoomEditing(true);
              }}
              className="flex items-center gap-1.5 px-1.5 py-0.5 text-[11px] font-mono text-vscode-fg-desc hover:text-vscode-fg-sidebar rounded-[3px] bg-[#2d2d2d] border border-[#454545] cursor-pointer shadow-sm transition-colors"
              title="Change Workspace Context"
            >
              <Codicon icon="codicon-repo" size={12} /> {room}
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] hover:text-vscode-fg-sidebar rounded-[3px] transition-colors ${
                modeDropdownOpen
                  ? "bg-[#2a2d2e] text-vscode-fg-sidebar"
                  : "text-vscode-fg-desc"
              }`}
              title="Agent Mode"
            >
              {agentMode}
              <Codicon icon="codicon-chevron-down" size={11} />
            </button>

            {modeDropdownOpen && (
              <div className="absolute bottom-[120%] right-0 mb-1 w-32 bg-[#252526] border border-[#454545] shadow-[0_-4px_16px_rgba(0,0,0,0.5)] rounded-[4px] py-1 z-50">
                <button
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] text-vscode-fg-sidebar text-[12px] flex items-center justify-between"
                  onClick={() => {
                    setAgentMode("Auto");
                    setModeDropdownOpen(false);
                  }}
                >
                  <span>Auto</span>
                  {agentMode === "Auto" && (
                    <Codicon
                      icon="codicon-check"
                      size={12}
                      className="text-[#3794ff]"
                    />
                  )}
                </button>
                <button
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] text-vscode-fg-sidebar text-[12px] flex items-center justify-between"
                  onClick={() => {
                    setAgentMode("Code");
                    setModeDropdownOpen(false);
                  }}
                >
                  <span>Code</span>
                  {agentMode === "Code" && (
                    <Codicon
                      icon="codicon-check"
                      size={12}
                      className="text-[#3794ff]"
                    />
                  )}
                </button>
                <button
                  className="w-full text-left px-3 py-1.5 hover:bg-[#094771] text-vscode-fg-sidebar text-[12px] flex items-center justify-between"
                  onClick={() => {
                    setAgentMode("Test");
                    setModeDropdownOpen(false);
                  }}
                >
                  <span>Test</span>
                  {agentMode === "Test" && (
                    <Codicon
                      icon="codicon-check"
                      size={12}
                      className="text-[#3794ff]"
                    />
                  )}
                </button>
              </div>
            )}
          </div>

          <span className="p-1 text-vscode-fg-icon opacity-80" title="설정">
            <Codicon icon="codicon-settings-gear" size={13} />
          </span>

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend || !input.trim()}
            className="ml-auto w-6 h-6 flex items-center justify-center rounded-[4px] text-vscode-fg-icon hover:bg-vscode-list-hover hover:text-vscode-fg-sidebar disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label="전송"
          >
            {cooldownSec > 0 ? (
              <span className="text-[11px] tabular-nums">{cooldownSec}</span>
            ) : (
              <Codicon icon="codicon-arrow-up" size={15} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
