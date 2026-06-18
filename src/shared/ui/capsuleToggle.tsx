"use client";

export interface CapsuleToggleOption<T extends string> {
  value: T;
  label: string;
}

interface CapsuleToggleProps<T extends string> {
  options: ReadonlyArray<CapsuleToggleOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** 각 버튼에 추가할 클래스 (예: 통화 토글에서 원/$ 너비 통일용 min-w). */
  buttonClassName?: string;
}

/**
 * 캡슐형 세그먼트 토글 (한 테두리 안에 버튼들, 선택된 항목 강조).
 * 분봉(일간/15분..)·통화(원/$) 등에서 공통으로 쓴다 — 디자인을 한 곳에서 관리.
 */
export function CapsuleToggle<T extends string>({
  options,
  value,
  onChange,
  className = "",
  buttonClassName = "",
}: CapsuleToggleProps<T>) {
  return (
    <div
      className={`flex h-6 items-center gap-0.5 rounded-[3px] border border-vscode-border-input bg-vscode-editor px-1 ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`flex h-5 cursor-pointer items-center justify-center rounded-[2px] px-1 text-[12px] ${buttonClassName} ${
            value === option.value
              ? "bg-vscode-list-active font-medium text-vscode-fg"
              : "text-vscode-fg-desc hover:text-vscode-fg"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
