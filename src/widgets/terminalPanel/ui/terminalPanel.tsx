"use client";

import { useState } from "react";
import { Codicon, Divider, IconButton, Input } from "@/shared/ui";
import { TerminalAlertStream, type TerminalLog } from "./terminalAlertStream";
import { mapAlertToLog, formatTime } from "./mapAlertToLog";
import { useAlertStream } from "../model";

type PanelTab = "PROBLEMS" | "OUTPUT" | "DEBUG CONSOLE" | "TERMINAL" | "PORTS";

function ProblemsToolbar() {
  return (
    <div className="flex items-center gap-0.5 px-1">
      <Input
        placeholder="Filter (e.g. text, **/*.ts, !**/node_modules/**)"
        width={200}
      />
      <IconButton
        variant="panel"
        icon="codicon-filter"
        label="Filter by type"
      />
      <IconButton
        variant="panel"
        icon="codicon-collapse-all"
        label="Collapse All"
      />
      <Divider />
      <IconButton
        variant="panel"
        icon="codicon-screen-full"
        label="Maximize Panel Size"
      />
      <IconButton variant="panel" icon="codicon-close" label="Close Panel" />
    </div>
  );
}

function OutputToolbar() {
  return (
    <div className="flex items-center gap-0.5 px-1">
      <Input placeholder="Filter output" width={200} />
      <button className="vs-select">
        Tasks
        <Codicon icon="codicon-chevron-down" size={12} />
      </button>
      <IconButton
        variant="panel"
        icon="codicon-list-filter"
        label="Toggle Output"
      />
      <IconButton variant="panel" icon="codicon-lock" label="Lock Output" />
      <Divider />
      <IconButton
        variant="panel"
        icon="codicon-screen-full"
        label="Maximize Panel Size"
      />
      <IconButton variant="panel" icon="codicon-close" label="Close Panel" />
    </div>
  );
}

function DebugConsoleToolbar() {
  return (
    <div className="flex items-center gap-0.5 px-1">
      <Input placeholder="Filter console" width={200} />
      <IconButton variant="panel" icon="codicon-search" label="Filter" />
      <IconButton variant="panel" icon="codicon-list-filter" label="Collapse" />
      <IconButton variant="panel" icon="codicon-lock" label="Lock" />
      <Divider />
      <IconButton
        variant="panel"
        icon="codicon-screen-full"
        label="Maximize Panel Size"
      />
      <IconButton variant="panel" icon="codicon-close" label="Close Panel" />
    </div>
  );
}

function PortsToolbar() {
  return (
    <div className="flex items-center gap-0.5 px-1">
      <Input placeholder="Filter ports (e.g. label, local addr)" width={200} />
      <IconButton variant="panel" icon="codicon-add" label="Forward a Port" />
      <Divider />
      <IconButton
        variant="panel"
        icon="codicon-screen-full"
        label="Maximize Panel Size"
      />
      <IconButton variant="panel" icon="codicon-close" label="Close Panel" />
    </div>
  );
}

function TerminalToolbar() {
  return (
    <div className="flex h-full items-center pr-1">
      <button className="terminal-tab" data-active="true">
        <Codicon icon="codicon-terminal" size={18} className="shrink-0" />
        <span>powershell</span>
      </button>

      <div className="flex h-full items-center gap-0.5 px-1">
        <IconButton
          variant="panel"
          icon="codicon-add"
          label="New Terminal (Ctrl+`)"
        />
        <IconButton
          variant="panel"
          icon="codicon-chevron-down"
          label="Launch Profile"
        />
        <IconButton
          variant="panel"
          icon="codicon-split-vertical"
          label="Split Terminal"
        />
        <IconButton
          variant="panel"
          icon="codicon-trash"
          label="Kill Terminal"
        />
        <IconButton
          variant="panel"
          icon="codicon-ellipsis"
          label="More Actions"
        />
        <Divider />
        <IconButton
          variant="panel"
          icon="codicon-screen-full"
          label="Maximize Panel Size"
        />
        <IconButton variant="panel" icon="codicon-close" label="Close Panel" />
      </div>
    </div>
  );
}

const PANEL_TABS: PanelTab[] = [
  "PROBLEMS",
  "OUTPUT",
  "DEBUG CONSOLE",
  "TERMINAL",
  "PORTS",
];

/**
 * TERMINAL 탭 본문 — 실시간 급변 알림 스트림.
 *
 * 로그인 시 Stream 소켓(`useAlertStream`)에 붙어 실데이터를 주입(제어 모드)하고,
 * 미로그인 시에는 데이터를 받을 수 없으므로 로그인 안내 줄만 표시한다.
 * 연결 상태(연결 중/연결됨)와 stream_error/연결 오류를 안내 줄로 노출한다.
 */
function TerminalTabContent() {
  const { alerts, error, status, statusAt, isAuthed } = useAlertStream();

  if (!isAuthed) {
    return (
      <TerminalAlertStream
        logs={[
          {
            id: "stream-auth",
            time: "",
            level: "INFO",
            label: "stream",
            note: "로그인 후 실시간 급변 알림을 받을 수 있습니다.",
          },
        ]}
      />
    );
  }

  const logs: TerminalLog[] = [];
  const statusTime = statusAt ? formatTime(statusAt) : "";

  // 연결 상태 안내 줄 — 사용자가 "연결됨"을 인지할 수 있게.
  if (status === "connecting") {
    logs.push({
      id: "stream-status",
      time: statusTime,
      level: "INFO",
      label: "stream",
      note: "실시간 알림 스트림에 연결 중…",
    });
  } else if (status === "connected") {
    logs.push({
      id: "stream-status",
      time: statusTime,
      level: "INFO",
      label: "stream",
      note: "실시간 급변 알림 스트림에 연결되었습니다. 급변 발생 시 여기에 표시됩니다.",
    });
  }

  for (const alert of alerts) logs.push(mapAlertToLog(alert));

  if (error) {
    logs.push({
      id: "stream-error",
      time: statusTime,
      level: "CRITICAL",
      label: "stream",
      note: error,
    });
  }
  return <TerminalAlertStream logs={logs} />;
}

interface PanelAreaProps {
  height: number;
}

export function PanelArea({ height }: PanelAreaProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("TERMINAL");

  function renderToolbar() {
    switch (activeTab) {
      case "PROBLEMS":
        return <ProblemsToolbar />;
      case "OUTPUT":
        return <OutputToolbar />;
      case "DEBUG CONSOLE":
        return <DebugConsoleToolbar />;
      case "PORTS":
        return <PortsToolbar />;
      default:
        return <TerminalToolbar />;
    }
  }

  return (
    <div
      className="flex shrink-0 flex-col overflow-hidden h-(--panel-height) bg-vscode-panel border-t border-vscode-border-panel z-(--z-panel)"
      style={{ height }}
    >
      {/* Tab Bar */}
      <div className="flex shrink-0 items-center overflow-hidden justify-between h-(--panel-tabbar-height) border-b border-vscode-border-panel">
        <div
          role="tablist"
          aria-label="Panel"
          className="flex h-full shrink-0 items-center"
          onKeyDown={(e) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            const currentIdx = PANEL_TABS.indexOf(activeTab);
            const nextIdx =
              e.key === "ArrowRight"
                ? (currentIdx + 1) % PANEL_TABS.length
                : (currentIdx - 1 + PANEL_TABS.length) % PANEL_TABS.length;
            const nextTab = PANEL_TABS[nextIdx];
            setActiveTab(nextTab);
            (e.currentTarget as HTMLElement)
              .querySelectorAll<HTMLElement>('[role="tab"]')
              [nextIdx]?.focus();
          }}
        >
          {PANEL_TABS.map((tab) => (
            <button
              key={tab}
              id={`panel-tab-${tab.replace(/\s+/g, "-")}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls="panel-content"
              tabIndex={activeTab === tab ? 0 : -1}
              className="panel-tab"
              data-active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="ml-auto flex h-full min-w-0 items-center justify-end overflow-hidden">
          {renderToolbar()}
        </div>
      </div>

      {/* Content */}
      <div
        id="panel-content"
        role="tabpanel"
        aria-labelledby={`panel-tab-${activeTab.replace(/\s+/g, "-")}`}
        className={`panel-content${activeTab === "DEBUG CONSOLE" ? " panel-content-debug" : ""}`}
      >
        {activeTab === "PROBLEMS" && (
          <div className="text-vscode-fg-desc text-[13px]">
            No problems have been detected in the workspace.
          </div>
        )}
        {activeTab === "OUTPUT" && (
          <div className="text-vscode-fg-desc text-[13px]">
            Select a task to see its output.
          </div>
        )}
        {activeTab === "DEBUG CONSOLE" && (
          <div className="debug-console">
            <div className="debug-console-output" />
            <div className="debug-console-input-row">
              <Codicon
                icon="codicon-chevron-right"
                size={16}
                className="debug-console-prompt"
              />
              <input
                placeholder="Please start a debug session to evaluate expressions"
                className="debug-console-input"
              />
            </div>
          </div>
        )}
        {activeTab === "TERMINAL" && <TerminalTabContent />}
        {activeTab === "PORTS" && (
          <div className="text-vscode-fg-desc text-[13px]">
            No forwarded ports. Forward a port to access your locally running
            services over the internet.
          </div>
        )}
      </div>
    </div>
  );
}
