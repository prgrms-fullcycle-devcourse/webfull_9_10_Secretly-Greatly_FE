"use client";

import { useState, useEffect } from "react";
import { Codicon } from "@/shared/ui";

/**
 * 완벽한 위장을 위한 가짜(Fake) Claude Code 화면
 * 상사가 뒤를 지나갈 때 이 탭을 켜두면, 마치 AI가 코드를 분석하고 작성 중인 것처럼 보입니다.
 */
export function FakeClaudeCodeView() {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    // 1.5초마다 로그가 하나씩 추가되는 애니메이션 효과
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % 6);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const logs = [
    "Analyzing workspace dependencies...",
    "Found 14 files matching 'auth' context.",
    "Drafting implementation plan for JWT rotation.",
    "Updating src/features/auth/model.ts...",
    "Running type checks... OK.",
    "Commiting changes to branch 'feat/auth-rotation'.",
  ];

  return (
    <div className="flex flex-col h-full bg-vscode-sidebar text-vscode-fg-sidebar text-[12px] p-3 overflow-y-auto animate-in fade-in duration-200">
      {/* Current Task */}
      <div className="mb-5">
        <div className="text-[10px] uppercase font-bold tracking-wider text-vscode-fg-desc mb-2 flex items-center gap-1.5">
          <Codicon icon="codicon-tasklist" size={12} /> Current Task
        </div>
        <div className="bg-[#1e1e1e] border border-[#333333] rounded-[4px] p-3 shadow-sm">
          <div className="font-medium text-[#d4d4d4] mb-1.5">
            Implement OAuth2 Refresh Token Rotation
          </div>
          <div className="text-vscode-fg-desc text-[11px] leading-relaxed">
            Updating the authentication flow to support secure refresh token
            rotation as per security review #144.
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="flex items-center gap-1 text-[#3794ff] text-[11px]">
              <Codicon icon="codicon-sync" size={11} className="animate-spin" />{" "}
              In Progress
            </span>
            <span className="text-vscode-fg-desc text-[10px]">
              · 4 files affected
            </span>
          </div>
        </div>
      </div>

      {/* Context Files */}
      <div className="mb-5">
        <div className="text-[10px] uppercase font-bold tracking-wider text-vscode-fg-desc mb-2 flex items-center gap-1.5">
          <Codicon icon="codicon-files" size={12} /> Active Context
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 py-1.5 px-2 hover:bg-[#2a2d2e] rounded-[3px] cursor-pointer transition-colors">
            <Codicon
              icon="codicon-file-code"
              size={13}
              className="text-[#519aba]"
            />
            <span className="text-[#cccccc]">src/features/auth/model.ts</span>
            <span className="ml-auto text-[10px] text-[#e2c08d]">M</span>
          </div>
          <div className="flex items-center gap-2 py-1.5 px-2 hover:bg-[#2a2d2e] rounded-[3px] cursor-pointer transition-colors">
            <Codicon
              icon="codicon-file-code"
              size={13}
              className="text-[#cbcb41]"
            />
            <span className="text-[#cccccc]">src/features/auth/api.ts</span>
            <span className="ml-auto text-[10px] text-[#e2c08d]">M</span>
          </div>
          <div className="flex items-center gap-2 py-1.5 px-2 hover:bg-[#2a2d2e] rounded-[3px] cursor-pointer transition-colors opacity-70">
            <Codicon
              icon="codicon-file-text"
              size={13}
              className="text-vscode-fg-desc"
            />
            <span className="text-[#cccccc]">package.json</span>
          </div>
        </div>
      </div>

      {/* Agent Logs */}
      <div className="mt-auto pb-2">
        <div className="text-[10px] uppercase font-bold tracking-wider text-vscode-fg-desc mb-2 flex items-center gap-1.5">
          <Codicon icon="codicon-terminal" size={12} /> Agent Output
        </div>
        <div className="font-mono text-[11px] bg-[#1e1e1e] p-2.5 rounded-[4px] border border-[#333333] h-[110px] overflow-hidden flex flex-col justify-end text-[#858585]">
          <div className="flex flex-col gap-1">
            {logs.slice(0, logIndex + 1).map((log, i) => (
              <div
                key={i}
                className={`truncate ${i === logIndex && i !== 5 ? "text-[#cccccc]" : ""}`}
              >
                <span className="text-[#569cd6] mr-2">❯</span>
                {log}
              </div>
            ))}
            {logIndex < 5 && (
              <div className="animate-pulse mt-1">
                <span className="text-[#569cd6] mr-2">❯</span>_
              </div>
            )}
            {logIndex === 5 && (
              <div className="text-[#89d185] mt-1">
                <span className="text-[#569cd6] mr-2">✔</span>Task completed
                successfully.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
