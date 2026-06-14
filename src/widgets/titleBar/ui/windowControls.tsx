"use client";

import { IconButton } from "@/shared/ui";

export function WindowControls() {
  return (
    <>
      <IconButton
        variant="window"
        label="Minimize"
        icon="codicon-chrome-minimize"
      />
      <IconButton
        variant="window"
        label="Restore"
        icon="codicon-chrome-restore"
      />
      <IconButton
        variant="window"
        danger
        label="Close"
        icon="codicon-chrome-close"
      />
    </>
  );
}
