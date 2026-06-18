"use client";

/**
 * SettingsPanel — VS Code '설정' 페이지를 본뜬 실제 설정 모달.
 *
 * 액티비티바의 설정(기어) 버튼이 `open-settings` 이벤트를 디스패치하면 열린다.
 * (과거 패닉 핫키의 위장 화면이었으나, 이제는 일반 설정 패널로 분리됨)
 */

import { useEffect, useState } from "react";
import { Codicon } from "@/shared/ui";

/* ── 설정 데이터 ───────────────────────────────────────── */
interface ToggleSetting {
  kind: "toggle";
  id: string;
  title: string;
  description: string;
  defaultOn: boolean;
}
interface SelectSetting {
  kind: "select";
  id: string;
  title: string;
  description: string;
  value: string;
  options: string[];
}
interface InputSetting {
  kind: "input";
  id: string;
  title: string;
  description: string;
  value: string;
}
type Setting = ToggleSetting | SelectSetting | InputSetting;

interface SettingsSection {
  /** 좌측 목차 라벨 */
  label: string;
  settings: Setting[];
}

/** 목차별 설정 묶음 — TOC 선택에 따라 우측 내용이 바뀐다. */
const SECTIONS: SettingsSection[] = [
  {
    label: "일반적으로 사용",
    settings: [
      {
        kind: "input",
        id: "Editor: Font Size",
        title: "글꼴 크기",
        description: "픽셀 단위의 글꼴 크기를 제어합니다.",
        value: "14",
      },
      {
        kind: "input",
        id: "Editor: Tab Size",
        title: "탭 크기",
        description: "한 탭에 해당하는 공백 수입니다.",
        value: "2",
      },
      {
        kind: "select",
        id: "Files: Auto Save",
        title: "자동 저장",
        description: "수정된 파일을 자동으로 저장할지 여부를 제어합니다.",
        value: "afterDelay",
        options: ["off", "afterDelay", "onFocusChange", "onWindowChange"],
      },
      {
        kind: "select",
        id: "Workbench: Color Theme",
        title: "색 테마",
        description: "워크벤치에서 사용되는 색 테마를 지정합니다.",
        value: "Dark Modern",
        options: ["Dark Modern", "Dark+", "Light Modern", "Monokai"],
      },
    ],
  },
  {
    label: "텍스트 편집기",
    settings: [
      {
        kind: "select",
        id: "Editor: Word Wrap",
        title: "자동 줄 바꿈",
        description: "줄을 어떻게 줄 바꿈할지 제어합니다.",
        value: "off",
        options: ["off", "on", "wordWrapColumn", "bounded"],
      },
      {
        kind: "toggle",
        id: "Editor: Format On Save",
        title: "저장 시 서식 지정",
        description: "파일을 저장할 때 자동으로 서식을 지정합니다.",
        defaultOn: true,
      },
      {
        kind: "toggle",
        id: "Editor: Minimap",
        title: "미니맵 표시",
        description: "편집기 미니맵을 표시할지 여부를 제어합니다.",
        defaultOn: true,
      },
      {
        kind: "select",
        id: "Editor: Cursor Style",
        title: "커서 스타일",
        description: "커서의 모양을 제어합니다.",
        value: "line",
        options: ["line", "block", "underline"],
      },
    ],
  },
  {
    label: "워크벤치",
    settings: [
      {
        kind: "select",
        id: "Workbench: Icon Theme",
        title: "파일 아이콘 테마",
        description: "워크벤치에서 사용되는 파일 아이콘 테마를 지정합니다.",
        value: "Seti",
        options: ["Seti", "Minimal", "None"],
      },
      {
        kind: "toggle",
        id: "Workbench: Tree Indent Guides",
        title: "들여쓰기 가이드",
        description: "트리에서 들여쓰기 가이드를 표시합니다.",
        defaultOn: true,
      },
      {
        kind: "select",
        id: "Workbench: Activity Bar Location",
        title: "활동 막대 위치",
        description: "활동 막대의 위치를 제어합니다.",
        value: "default",
        options: ["default", "top", "bottom", "hidden"],
      },
    ],
  },
  {
    label: "창",
    settings: [
      {
        kind: "toggle",
        id: "Window: Restore Windows",
        title: "창 복원",
        description: "다시 시작할 때 이전 창을 복원할지 여부입니다.",
        defaultOn: true,
      },
      {
        kind: "input",
        id: "Window: Zoom Level",
        title: "확대/축소 수준",
        description: "창의 확대/축소 수준을 조정합니다.",
        value: "0",
      },
    ],
  },
  {
    label: "기능",
    settings: [
      {
        kind: "toggle",
        id: "Terminal: Cursor Blinking",
        title: "터미널 커서 깜박임",
        description: "터미널 커서의 깜박임 여부를 제어합니다.",
        defaultOn: false,
      },
      {
        kind: "input",
        id: "Terminal: Font Size",
        title: "터미널 글꼴 크기",
        description: "터미널의 글꼴 크기를 제어합니다.",
        value: "13",
      },
    ],
  },
  {
    label: "애플리케이션",
    settings: [
      {
        kind: "select",
        id: "Update: Mode",
        title: "업데이트 모드",
        description: "업데이트를 받을 방식을 제어합니다.",
        value: "default",
        options: ["default", "start", "manual", "none"],
      },
      {
        kind: "toggle",
        id: "Telemetry: Enabled",
        title: "원격 측정 사용",
        description: "사용 데이터 및 오류를 전송할지 여부입니다.",
        defaultOn: false,
      },
    ],
  },
  {
    label: "보안",
    settings: [
      {
        kind: "toggle",
        id: "Security: Workspace Trust",
        title: "작업 영역 신뢰",
        description: "신뢰할 수 없는 작업 영역의 기능을 제한합니다.",
        defaultOn: true,
      },
    ],
  },
  {
    label: "확장",
    settings: [
      {
        kind: "toggle",
        id: "Extensions: Auto Update",
        title: "확장 자동 업데이트",
        description: "확장을 자동으로 업데이트할지 여부입니다.",
        defaultOn: true,
      },
      {
        kind: "toggle",
        id: "Extensions: Auto Check Updates",
        title: "업데이트 자동 확인",
        description: "확장 업데이트를 자동으로 확인합니다.",
        defaultOn: true,
      },
    ],
  },
];

/* ── 컨트롤들 ──────────────────────────────────────────── */
function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-(--radius-xs) border ${
        on
          ? "border-(--vscode-button-background) bg-(--vscode-button-background) text-(--vscode-button-foreground)"
          : "border-(--vscode-input-border) bg-(--vscode-input-background)"
      }`}
    >
      {on && <Codicon icon="codicon-check" size={12} />}
    </button>
  );
}

function Select({ value, options }: { value: string; options: string[] }) {
  const [val, setVal] = useState(value);
  return (
    <div className="relative inline-flex">
      <select
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="h-7 w-56 appearance-none rounded-(--radius-xs) border border-(--vscode-input-border) bg-(--vscode-input-background) pr-7 pl-2 text-(length:--font-size-md) text-(--vscode-input-foreground) outline-none focus:border-(--vscode-focus)"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Codicon
        icon="codicon-chevron-down"
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-vscode-fg-icon"
      />
    </div>
  );
}

function TextInput({ value }: { value: string }) {
  const [val, setVal] = useState(value);
  return (
    <input
      value={val}
      onChange={(e) => setVal(e.target.value)}
      className="h-7 w-56 rounded-(--radius-xs) border border-(--vscode-input-border) bg-(--vscode-input-background) px-2 text-(length:--font-size-md) text-(--vscode-input-foreground) outline-none focus:border-(--vscode-focus)"
    />
  );
}

function SettingRow({ setting }: { setting: Setting }) {
  return (
    <div className="border-b border-vscode-border-panel/60 py-4">
      <p className="mb-1 text-(length:--font-size-sm) text-vscode-fg-desc">
        {setting.id}
      </p>
      <p className="mb-1 text-(length:--font-size-lg) font-semibold text-vscode-fg">
        {setting.title}
      </p>
      <p className="mb-3 text-(length:--font-size-md) text-vscode-fg-desc">
        {setting.description}
      </p>
      {setting.kind === "toggle" && <Toggle defaultOn={setting.defaultOn} />}
      {setting.kind === "select" && (
        <Select value={setting.value} options={setting.options} />
      )}
      {setting.kind === "input" && <TextInput value={setting.value} />}
    </div>
  );
}

/* ── 설정 모달 본체 ────────────────────────────────────── */
function SettingsModal({ onClose }: { onClose: () => void }) {
  const [activeToc, setActiveToc] = useState(0);
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="설정"
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-(--radius-md) border border-vscode-border-widget bg-vscode-editor font-sans text-vscode-fg shadow-[var(--shadow-overlay)]"
      >
        {/* 타이틀 바 */}
        <div className="flex h-9 shrink-0 items-center justify-between border-b border-vscode-border-panel pr-2 pl-4">
          <span className="text-(length:--font-size-md)">설정</span>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-(--radius-xs) text-vscode-fg-icon hover:bg-(--vscode-list-hoverBackground)"
          >
            <Codicon icon="codicon-close" size={14} />
          </button>
        </div>

        {/* 검색 + 탭 */}
        <div className="flex shrink-0 flex-col gap-3 border-b border-vscode-border-panel px-4 py-3">
          <div className="flex h-8 items-center gap-2 rounded-(--radius-sm) border border-(--vscode-input-border) bg-(--vscode-input-background) px-3">
            <Codicon
              icon="codicon-search"
              size={14}
              className="text-vscode-fg-icon"
            />
            <input
              placeholder="설정 검색"
              className="min-w-0 flex-1 bg-transparent text-(length:--font-size-md) text-(--vscode-input-foreground) outline-none"
            />
          </div>
          <div className="flex items-center gap-4 text-(length:--font-size-md)">
            <span className="border-b-2 border-(--vscode-panelTitle-activeBorder) pb-1 text-vscode-fg">
              사용자
            </span>
            <span className="pb-1 text-vscode-fg-desc">작업 영역</span>
          </div>
        </div>

        {/* 본문: 좌측 목차 + 우측 설정 목록 */}
        <div className="flex min-h-0 flex-1">
          <nav className="w-48 shrink-0 overflow-auto border-r border-vscode-border-panel px-3 py-3">
            {SECTIONS.map((section, i) => (
              <button
                key={section.label}
                type="button"
                onClick={() => setActiveToc(i)}
                className={`block w-full rounded-(--radius-xs) px-3 py-1 text-left text-(length:--font-size-md) ${
                  i === activeToc
                    ? "bg-(--vscode-list-activeSelectionBackground) text-(--vscode-list-activeSelectionForeground)"
                    : "text-vscode-fg-desc hover:bg-(--vscode-list-hoverBackground)"
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1 overflow-auto px-6 py-1">
            {SECTIONS[activeToc].settings.map((setting) => (
              <SettingRow key={setting.id} setting={setting} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 설정 패널 컨트롤러 — `open-settings` 이벤트로 열고 ESC/닫기로 닫는다. */
export function SettingsPanel() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("open-settings", onOpen);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("open-settings", onOpen);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!open) return null;
  return <SettingsModal onClose={() => setOpen(false)} />;
}
