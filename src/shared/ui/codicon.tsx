import type { HTMLAttributes } from "react";

interface CodiconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Full codicon class, e.g. "codicon-close". */
  icon: string;
  size?: number;
}

export function Codicon({
  icon,
  size = 16,
  className = "",
  style,
  ...rest
}: CodiconProps) {
  return (
    <span
      aria-hidden="true"
      {...rest}
      className={`codicon ${icon}${className ? ` ${className}` : ""}`}
      style={{ fontSize: size, ...style }}
    />
  );
}
