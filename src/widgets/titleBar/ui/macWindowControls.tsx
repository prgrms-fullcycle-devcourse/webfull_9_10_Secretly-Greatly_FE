"use client";

import { Codicon } from "@/shared/ui";

export function MacWindowControls() {
  return (
    <div className="flex items-center gap-[8px] pl-4 pr-3 h-full shrink-0">
      <button
        type="button"
        className="w-[12px] h-[12px] rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center group outline-none"
        aria-label="Close"
      >
        <Codicon
          icon="codicon-close"
          size={10}
          className="opacity-0 group-hover:opacity-100 text-[#4c0000] scale-75"
        />
      </button>
      <button
        type="button"
        className="w-[12px] h-[12px] rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center group outline-none"
        aria-label="Minimize"
      >
        <Codicon
          icon="codicon-chrome-minimize"
          size={10}
          className="opacity-0 group-hover:opacity-100 text-[#5a3e00] scale-75"
        />
      </button>
      <button
        type="button"
        className="w-[12px] h-[12px] rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center group outline-none"
        aria-label="Maximize"
      >
        <Codicon
          icon="codicon-chrome-restore"
          size={10}
          className="opacity-0 group-hover:opacity-100 text-[#004d00] scale-75 transform rotate-45"
        />
      </button>
    </div>
  );
}
