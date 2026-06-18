"use client";

import { useState, useRef, useEffect } from "react";
import { Codicon } from "@/shared/ui";

export interface AgentHeaderProps {
  activeTab: "CHAT" | "CLAUDE";
  setActiveTab: (tab: "CHAT" | "CLAUDE") => void;
  onExpand?: () => void;
  isExpanded?: boolean;
  onClose?: () => void;
  showToast: (msg: string) => void;
}

export function AgentHeader({
  activeTab,
  setActiveTab,
  onExpand,
  isExpanded,
  onClose,
  showToast,
}: AgentHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setHistoryDropdownOpen(false);
      }
    };
    if (dropdownOpen || historyDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen, historyDropdownOpen]);

  const handleActionClick = (action: string) => {
    setDropdownOpen(false);
    setHistoryDropdownOpen(false);
  };

  const handleSettingsClick = () => {
    window.dispatchEvent(new CustomEvent("open-settings"));
    showToast("Settings panel opened");
  };

  const toggleFullscreen = async () => {
    if (onExpand) {
      onExpand();
      return;
    }
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      showToast("Fullscreen is not supported by your browser.");
    }
  };

  return (
    <div className="flex items-center shrink-0 h-[35px] pl-2 pr-1.5 gap-1 relative z-10">
      <button
        type="button"
        className={`px-2 py-1 text-[11px] uppercase tracking-wider font-semibold border-b-2 transition-colors ${
          activeTab === "CHAT"
            ? "text-vscode-fg-sidebar border-[#3794ff]"
            : "text-vscode-fg-desc border-transparent hover:text-vscode-fg-sidebar"
        }`}
        onClick={() => setActiveTab("CHAT")}
      >
        Chat
      </button>

      <button
        type="button"
        className={`px-2 py-1 text-[11px] uppercase tracking-wider font-semibold border-b-2 transition-colors ${
          activeTab === "CLAUDE"
            ? "text-vscode-fg-sidebar border-[#3794ff]"
            : "text-vscode-fg-desc border-transparent hover:text-vscode-fg-sidebar"
        }`}
        onClick={() => setActiveTab("CLAUDE")}
      >
        Claude Code
      </button>

      {/* 우측 아이콘 영역 */}
      <div
        className="ml-auto flex items-center text-vscode-fg-icon relative"
        ref={menuRef}
      >
        {/* 새 채팅 & 히스토리 분리 아이콘 */}
        <div className="flex items-center mr-0.5 relative">
          <button
            className="p-1 opacity-80 hover:bg-vscode-list-hover hover:text-vscode-fg-sidebar rounded-l"
            title="New Chat"
            onClick={() => {
              setActiveTab("CHAT");
            }}
          >
            <Codicon icon="codicon-add" size={14} />
          </button>
          <button
            className={`p-1 pl-0 opacity-80 hover:bg-vscode-list-hover hover:text-vscode-fg-sidebar rounded-r ${
              historyDropdownOpen ? "bg-[#2a2d2e] text-vscode-fg-sidebar" : ""
            }`}
            title="Chat History"
            onClick={() => {
              setHistoryDropdownOpen(!historyDropdownOpen);
              setDropdownOpen(false);
            }}
          >
            <Codicon icon="codicon-chevron-down" size={10} />
          </button>
          {/* 새 채팅 옵션 드롭다운 */}
          {historyDropdownOpen && (
            <div className="absolute top-[120%] right-0 mt-0.5 w-56 bg-[#252526] border border-[#454545] shadow-[0_4px_16px_rgba(0,0,0,0.5)] rounded-[4px] py-1 z-50">
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-[#094771] text-vscode-fg-sidebar text-[12px] flex items-center justify-between"
                onClick={() => handleActionClick("New Chat")}
              >
                <span>New Chat</span>
                <span className="text-[10px] text-vscode-fg-desc font-mono">
                  ⌘ N
                </span>
              </button>
              <div className="h-[1px] bg-[#454545] my-1 mx-2" />
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-[#094771] text-vscode-fg-sidebar text-[12px] flex items-center justify-between"
                onClick={() => handleActionClick("New Chat Editor")}
              >
                <span>New Chat Editor</span>
                <span className="text-[10px] text-vscode-fg-desc font-mono">
                  ⌘ N
                </span>
              </button>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-[#094771] text-vscode-fg-sidebar text-[12px] flex items-center justify-between"
                onClick={() => handleActionClick("New Chat Window")}
              >
                <span>New Chat Window</span>
              </button>
              <div className="h-[1px] bg-[#454545] my-1 mx-2" />
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-[#094771] text-vscode-fg-sidebar text-[12px] flex items-center justify-between"
                onClick={() => handleActionClick("New Codex Agent")}
              >
                <span>New Codex Agent</span>
              </button>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-[#094771] text-vscode-fg-sidebar text-[12px] flex items-center justify-between"
                onClick={() => handleActionClick("New Copilot CLI Session")}
              >
                <span>New Copilot CLI Session</span>
              </button>
            </div>
          )}
        </div>

        {/* 설정 아이콘 */}
        <button
          className="p-1 opacity-80 hover:bg-vscode-list-hover hover:text-vscode-fg-sidebar rounded"
          title="Panic Mode Settings"
          onClick={handleSettingsClick}
        >
          <Codicon icon="codicon-settings-gear" size={14} />
        </button>

        {/* 더보기(Ellipsis) 컨텍스트 메뉴 */}
        <div className="relative">
          <button
            className={`p-1 opacity-80 hover:bg-vscode-list-hover hover:text-vscode-fg-sidebar rounded ${
              dropdownOpen ? "bg-[#2a2d2e] text-vscode-fg-sidebar" : ""
            }`}
            title="More Actions..."
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setHistoryDropdownOpen(false);
            }}
          >
            <Codicon icon="codicon-ellipsis" size={14} />
          </button>

          {/* 드롭다운 메뉴 */}
          {dropdownOpen && (
            <div className="absolute top-[120%] right-0 mt-0.5 w-48 bg-[#252526] border border-[#454545] shadow-[0_4px_16px_rgba(0,0,0,0.5)] rounded-[4px] py-1 z-50">
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-[#094771] text-vscode-fg-sidebar text-[12px]"
                onClick={() => handleActionClick("View Logs")}
              >
                View Logs
              </button>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-[#094771] text-vscode-fg-sidebar text-[12px]"
                onClick={() => handleActionClick("Clear Chat History")}
              >
                Clear Chat History
              </button>
              <div className="h-[1px] bg-[#454545] my-1 mx-2" />
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-[#094771] text-vscode-fg-sidebar text-[12px] flex items-center justify-between"
                onClick={() => handleActionClick("Settings")}
              >
                <span>Settings</span>
                <span className="text-[10px] text-vscode-fg-desc">⌘ ,</span>
              </button>
            </div>
          )}
        </div>

        {/* 전체화면 아이콘 */}
        <button
          className="p-1 opacity-80 hover:bg-vscode-list-hover hover:text-vscode-fg-sidebar rounded"
          title={isExpanded ? "Collapse Panel" : "Expand Panel"}
          onClick={toggleFullscreen}
        >
          <Codicon
            icon={isExpanded ? "codicon-collapse-all" : "codicon-screen-full"}
            size={13}
          />
        </button>

        {/* 닫기 아이콘 (진짜 동작함!) */}
        <button
          className="p-1 opacity-80 hover:bg-[#e81123] hover:text-white rounded"
          title="Close Agent Panel"
          onClick={() => {
            if (onClose) onClose();
            else showToast("Close action triggered");
          }}
        >
          <Codicon icon="codicon-close" size={14} />
        </button>
      </div>
    </div>
  );
}
