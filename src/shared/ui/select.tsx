"use client";

import { useState } from "react";
import { Codicon } from "./codicon";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  options: ReadonlyArray<SelectOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** 접근성/툴팁 라벨 (예: "정렬"). */
  label?: string;
  /** 메뉴 정렬 — 버튼 왼쪽(left) 또는 오른쪽(right) 모서리 기준. 기본 left. */
  align?: "left" | "right";
  className?: string;
}

/**
 * 드롭다운 셀렉트 — 현재값 칩(+▾) 클릭 시 옵션 메뉴(체크 표시). 차트 봉 단위 셀렉트와 동일 디자인.
 * 정렬·필터 등 단일 선택에 공통으로 쓴다.
 */
export function Select<T extends string>({
  options,
  value,
  onChange,
  label,
  align = "left",
  className = "",
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const active = options.find((o) => o.value === value) ?? options[0];
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        onClick={() => setOpen((o) => !o)}
        className="flex h-6 cursor-pointer items-center gap-1 rounded-[3px] border border-vscode-border-input bg-vscode-editor px-1.5 text-[12px] text-vscode-fg hover:bg-vscode-list-hover"
      >
        <span>{active?.label}</span>
        <Codicon icon="codicon-chevron-down" size={12} />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-(--z-dropdown) cursor-default"
          />
          <div
            role="menu"
            className={`absolute top-7 z-[calc(var(--z-dropdown)+1)] min-w-24 rounded-[5px] border border-vscode-border-menu bg-vscode-menu py-1 shadow-(--shadow-dropdown) ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {options.map((option) => {
              const isActive = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="flex h-6.5 w-full cursor-pointer items-center gap-2 px-2.5 text-left text-[13px] text-(--vscode-menu-foreground) hover:bg-(--vscode-menu-selectionBackground) hover:text-(--vscode-menu-selectionForeground)"
                >
                  <span className="flex w-3.5 justify-center">
                    {isActive && <Codicon icon="codicon-check" size={13} />}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
