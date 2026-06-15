"use client";

import { useState } from "react";
import { Codicon } from "@/shared/ui";

export function AgentFooter() {
  const [footerEnvOpen, setFooterEnvOpen] = useState(false);

  return (
    <div className="shrink-0 flex items-center gap-3 px-3 py-1.5 text-[11px] text-vscode-fg-desc border-t border-vscode-border-sidebar bg-vscode-sidebar z-10 relative">
      <div className="relative">
        <button
          className={`flex items-center gap-1 px-1 py-0.5 rounded transition-colors ${
            footerEnvOpen
              ? "bg-[#2a2d2e] text-vscode-fg-sidebar"
              : "hover:bg-vscode-list-hover hover:text-vscode-fg-sidebar"
          }`}
          onClick={() => setFooterEnvOpen(!footerEnvOpen)}
        >
          <Codicon icon="codicon-device-desktop" size={12} />
          Local
        </button>

        {footerEnvOpen && (
          <div className="absolute bottom-[120%] left-0 mb-1 w-48 bg-[#252526] border border-[#454545] shadow-[0_-4px_16px_rgba(0,0,0,0.5)] rounded-[4px] py-1 z-50">
            <button
              className="w-full text-left px-3 py-1.5 hover:bg-[#094771] text-vscode-fg-sidebar text-[12px] flex items-center gap-2"
              onClick={() => setFooterEnvOpen(false)}
            >
              <Codicon icon="codicon-device-desktop" size={12} /> Local
              Environment
              <Codicon
                icon="codicon-check"
                size={12}
                className="ml-auto text-[#3794ff]"
              />
            </button>
            <button
              className="w-full text-left px-3 py-1.5 hover:bg-[#094771] text-vscode-fg-sidebar text-[12px] flex items-center gap-2"
              onClick={() => setFooterEnvOpen(false)}
            >
              <Codicon icon="codicon-cloud" size={12} /> Connect to Remote...
            </button>
          </div>
        )}
      </div>

      <button className="flex items-center gap-1 hover:bg-vscode-list-hover hover:text-vscode-fg-sidebar px-1 py-0.5 rounded transition-colors">
        <Codicon icon="codicon-shield" size={12} />
        Default Approvals
      </button>
    </div>
  );
}
