import type { MouseEvent, ReactNode } from "react";
import { Codicon } from "./codicon";

type IconButtonVariant = "panel" | "search" | "titlebar" | "window";

interface IconButtonProps {
  label: string;
  variant?: IconButtonVariant;
  danger?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  /** Codicon shortcut, e.g. "codicon-add". Use children instead for SVG glyphs. */
  icon?: string;
  iconSize?: number;
  children?: ReactNode;
}

export function IconButton({
  label,
  variant = "panel",
  danger = false,
  onClick,
  className = "",
  icon,
  iconSize = 16,
  children,
}: IconButtonProps) {
  const variantClass =
    variant === "window" && danger
      ? "icon-btn--window icon-btn--window-danger"
      : `icon-btn--${variant}`;
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`icon-btn ${variantClass} shrink-0${className ? ` ${className}` : ""}`}
    >
      {icon ? <Codicon icon={icon} size={iconSize} /> : children}
    </button>
  );
}
