import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  width?: number | string;
}

export function Input({ width, className = "", style, ...rest }: InputProps) {
  return (
    <input
      className={`vs-input${className ? ` ${className}` : ""}`}
      style={{ width, ...style }}
      {...rest}
    />
  );
}
