"use client";

import { useState } from "react";
import { Codicon, Divider, IconButton, Input } from "@/shared/ui";

type PanelTab = "PROBLEMS" | "OUTPUT" | "DEBUG CONSOLE" | "TERMINAL" | "PORTS";

interface TerminalInstance {
  id: string;
  name: string;
}

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

function TerminalToolbar({
  instances,
  activeKey,
  onSelect,
}: {
  instances: TerminalInstance[];
  activeKey: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex h-full items-center pr-1">
      {instances.map((terminal) => (
        <button
          key={terminal.id}
          onClick={() => onSelect(terminal.id)}
          className="terminal-tab"
          data-active={activeKey === terminal.id}
        >
          <Codicon icon="codicon-terminal" size={18} className="shrink-0" />
          <span>powershell - {terminal.name}</span>
        </button>
      ))}

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

export function PanelArea() {
  const [activeTab, setActiveTab] = useState<PanelTab>("TERMINAL");
  const [terminals] = useState<TerminalInstance[]>([
    { id: "1", name: "webfull_9_10_Secretly-Greatly_FE" },
  ]);
  const [activeTerminal, setActiveTerminal] = useState("1");

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
        return (
          <TerminalToolbar
            instances={terminals}
            activeKey={activeTerminal}
            onSelect={setActiveTerminal}
          />
        );
    }
  }

  return (
    <div className="flex shrink-0 flex-col overflow-hidden h-[var(--panel-height)] bg-vscode-panel border-t border-vscode-border-panel z-[var(--z-panel)]">
      {/* Tab Bar */}
      <div className="flex shrink-0 items-center overflow-hidden justify-between h-[var(--panel-tabbar-height)] border-b border-vscode-border-panel">
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
        className="flex-1 overflow-auto px-2 py-1 font-mono text-[13px] leading-[18px] text-terminal-fg"
      >
        {activeTab === "PROBLEMS" && (
          <div className="text-vscode-fg-desc px-1 py-2 text-[13px]">
            No problems have been detected in the workspace.
          </div>
        )}
        {activeTab === "OUTPUT" && (
          <div className="text-vscode-fg-desc px-1 py-2 text-[13px]">
            Select a task to see its output.
          </div>
        )}
        {activeTab === "DEBUG CONSOLE" && (
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-auto text-vscode-fg-desc text-[13px]" />
            <div className="flex shrink-0 items-center gap-1.5 border-t border-vscode-border-panel pt-1">
              <Codicon
                icon="codicon-chevron-right"
                size={16}
                className="shrink-0 text-vscode-fg-icon"
              />
              <input
                placeholder="Please start a debug session to evaluate expressions"
                className="min-w-0 flex-1 border-0 bg-transparent outline-none text-vscode-fg-input font-mono text-[13px]"
              />
            </div>
          </div>
        )}
        {activeTab === "TERMINAL" && (
          <div>
            <span className="text-terminal-cyan">user@screet</span>
            <span className="text-vscode-fg">:</span>
            <span className="text-terminal-blue">
              ~/screet/webfull_9_10_Secretly-Greatly_FE
            </span>
            <span className="text-vscode-fg"> $ </span>
            <span className="text-vscode-fg-editor">pnpm dev</span>
          </div>
        )}
        {activeTab === "PORTS" && (
          <div className="text-vscode-fg-desc px-1 py-2 text-[13px]">
            No forwarded ports. Forward a port to access your locally running
            services over the internet.
          </div>
        )}
      </div>
    </div>
  );
}
