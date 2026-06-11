"use client";

import { IconButton } from "@/shared/ui";

interface LayoutControlsProps {
  onToggleSidebar?: () => void;
  onTogglePanel?: () => void;
  onToggleSecondarySidebar?: () => void;
}

export function LayoutControls({
  onToggleSidebar,
  onTogglePanel,
  onToggleSecondarySidebar,
}: LayoutControlsProps) {
  return (
    <div className="flex items-center gap-0">
      <IconButton
        variant="titlebar"
        label="Toggle Primary Side Bar (Ctrl+B)"
        icon="codicon-layout-sidebar-left"
        onClick={onToggleSidebar}
      />
      <IconButton
        variant="titlebar"
        label="Toggle Panel (Ctrl+J)"
        icon="codicon-layout-panel"
        onClick={onTogglePanel}
      />
      <IconButton
        variant="titlebar"
        label="Toggle Secondary Side Bar (Ctrl+Alt+B)"
        icon="codicon-layout-sidebar-right"
        onClick={onToggleSecondarySidebar}
      />
      <IconButton
        variant="titlebar"
        label="Customize Layout"
        icon="codicon-layout-centered"
      />
    </div>
  );
}
