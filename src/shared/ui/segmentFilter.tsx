import type { ReactNode } from "react";

export interface SegmentFilterOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentFilterProps<T extends string> {
  options: readonly SegmentFilterOption<T>[];
  value: T;
  onValueChange?: (value: T) => void;
  className?: string;
  buttonClassName?: string;
}

export function SegmentFilter<T extends string>({
  options,
  value,
  onValueChange,
  className = "",
  buttonClassName = "",
}: SegmentFilterProps<T>) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          data-active={value === option.value}
          onClick={() => onValueChange?.(option.value)}
          className={`h-6 min-w-11.25 rounded-xs border border-vscode-border-input bg-transparent px-2.75 text-center text-[12px] leading-4 text-vscode-fg-desc hover:bg-vscode-list-hover data-[active=true]:border-vscode-focus data-[active=true]:bg-(--vscode-button-background) data-[active=true]:text-(--vscode-button-foreground) ${buttonClassName}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
