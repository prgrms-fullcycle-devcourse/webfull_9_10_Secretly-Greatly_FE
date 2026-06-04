"use client";

/**
 * NotificationCenter — VS Code 스타일 알림 센터(우측 하단 토스트 스택).
 *
 * - 비즈니스 도메인을 모르는 순수 UI 컴포넌트입니다. (shared 레이어 규칙 준수)
 * - 색상/간격/그림자/zIndex 등 모든 값은 `tokens.css`의 디자인 토큰을 사용합니다.
 * - 스타일은 Tailwind 유틸리티 우선, 토큰은 arbitrary value(`[var(--token)]`)로 연결합니다.
 * - 제어 모델은 두 축이 독립적입니다: 열림 상태는 `open`을 주면 제어, 없으면 내부 관리.
 *   개별 닫기는 `onDismiss`를 주면 부모가 관리, 없으면 내부 `dismissed` 상태로 처리합니다.
 *
 * @example
 * <NotificationCenter
 *   items={[
 *     { id: "1", message: "WSL configuration changed.", source: "Chat for Claude Code",
 *       actions: [{ label: "OK", primary: true }] },
 *   ]}
 * />
 */

import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { Codicon } from "./codicon";

export type NotificationSeverity = "info" | "warning" | "error";

export interface NotificationAction {
  /** 버튼 라벨 (예: "OK", "View") */
  label: string;
  /** 강조(파란색) 버튼 여부 */
  primary?: boolean;
  /** 클릭 시 해당 알림을 자동으로 닫을지 (기본 false) */
  dismissOnClick?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface NotificationItem {
  /** 고유 식별자 */
  id: string;
  /** 본문 메시지 */
  message: ReactNode;
  /** 알림을 발생시킨 소스 (예: "Claude Code for VS Code") */
  source?: string;
  /** 심각도 — 좌측 아이콘 색상/모양 결정 (기본 info) */
  severity?: NotificationSeverity;
  /** 하단 액션 버튼들 */
  actions?: NotificationAction[];
  /** 설정(톱니바퀴) 버튼 노출 여부 (기본 true) */
  configurable?: boolean;
}

export interface NotificationCenterProps {
  /** 표시할 알림 목록 */
  items: NotificationItem[];
  /** 센터 헤더 라벨 (기본 "NOTIFICATIONS") */
  title?: string;
  /** 개별 알림 닫기 콜백 */
  onDismiss?: (id: string) => void;
  /** 전체 비우기 콜백 */
  onClearAll?: () => void;
  /** 열림 상태 (제어 컴포넌트). 부모가 상태표시줄 종과 연결해 제어할 때 사용. */
  open?: boolean;
  /** 비제어 모드일 때 초기 열림 상태 (기본 true) */
  defaultOpen?: boolean;
  /** 열림 상태 변경 콜백. 헤더 ▼ 버튼을 누르면 false 가 전달됨. */
  onOpenChange?: (open: boolean) => void;
  /** 우측 하단 종(bell) 아이콘을 가리키는 꼬리 화살표 표시 (기본 true) */
  showPointer?: boolean;
  /** 표시할 알림이 없을 때 보여줄 문구 (기본 "새 알림 없음") */
  emptyMessage?: string;
  /** 추가 클래스 */
  className?: string;
}

const SEVERITY_ICON: Record<NotificationSeverity, string> = {
  info: "codicon-info",
  warning: "codicon-warning",
  error: "codicon-error",
};

const SEVERITY_COLOR: Record<NotificationSeverity, string> = {
  info: "var(--vscode-notificationsInfoIcon-foreground)",
  warning: "var(--vscode-notificationsWarningIcon-foreground)",
  error: "var(--vscode-notificationsErrorIcon-foreground)",
};

/* ── 액션 버튼 클래스 (공통 base + variant) ──────────────── */
const ACTION_BTN_BASE =
  "h-[24px] rounded-[var(--radius-xs)] border-0 px-[var(--space-5)] text-[var(--font-size-md)] cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--easing-default)]";
const ACTION_BTN_PRIMARY =
  "bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]";
const ACTION_BTN_SECONDARY =
  "bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)]";

/* ── 헤더 아이콘 버튼 ──────────────────────────────────── */
function HeaderButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[var(--radius-xs)]
                 border-0 bg-transparent text-[var(--vscode-icon-foreground)]
                 transition-colors duration-[var(--duration-fast)] ease-[var(--easing-default)]
                 hover:bg-[var(--vscode-list-hoverBackground)] hover:text-[var(--vscode-foreground)]
                 cursor-pointer"
    >
      <Codicon icon={icon} size={16} />
    </button>
  );
}

/* ── 개별 알림 행 ──────────────────────────────────────── */
function NotificationRow({
  item,
  onDismiss,
}: {
  item: NotificationItem;
  onDismiss?: (id: string) => void;
}) {
  const severity = item.severity ?? "info";
  const configurable = item.configurable ?? true;

  return (
    <li
      className="group flex flex-col gap-[var(--space-4)] px-[var(--space-5)] py-[var(--space-4)]
                 border-b border-[var(--vscode-notifications-border)] last:border-b-0"
    >
      {/* 메시지 줄 */}
      <div className="flex items-start gap-[var(--space-4)]">
        <Codicon
          icon={SEVERITY_ICON[severity]}
          size={16}
          className="mt-[2px] shrink-0"
          style={{ color: SEVERITY_COLOR[severity] }}
        />

        <p className="min-w-0 flex-1 text-[var(--font-size-lg)] leading-[var(--line-height-normal)] text-[var(--vscode-notifications-foreground)]">
          {item.message}
        </p>

        {/* 우측 액션 아이콘 (설정 / 닫기) */}
        <div className="flex shrink-0 items-center gap-[var(--space-1)]">
          {configurable && (
            <button
              type="button"
              title="Configure"
              aria-label="Configure notification"
              className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-xs)]
                         border-0 bg-transparent text-[var(--vscode-icon-foreground)]
                         opacity-0 transition-[opacity,background-color,color]
                         duration-[var(--duration-fast)] ease-[var(--easing-default)]
                         hover:bg-[var(--vscode-list-hoverBackground)] hover:text-[var(--vscode-foreground)]
                         group-hover:opacity-100 cursor-pointer"
            >
              <Codicon icon="codicon-gear" size={14} />
            </button>
          )}
          <button
            type="button"
            title="Clear notification"
            aria-label="Clear notification"
            onClick={() => onDismiss?.(item.id)}
            className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-xs)]
                       border-0 bg-transparent text-[var(--vscode-icon-foreground)]
                       transition-colors duration-[var(--duration-fast)] ease-[var(--easing-default)]
                       hover:bg-[var(--vscode-list-hoverBackground)] hover:text-[var(--vscode-foreground)]
                       cursor-pointer"
          >
            <Codicon icon="codicon-close" size={14} />
          </button>
        </div>
      </div>

      {/* 소스 + 액션 버튼 줄 */}
      {(item.source || (item.actions && item.actions.length > 0)) && (
        <div className="flex items-center gap-[var(--space-5)] pl-[calc(16px_+_var(--space-4))]">
          {item.source && (
            <span className="min-w-0 flex-1 truncate text-[var(--font-size-md)] text-[var(--vscode-descriptionForeground)]">
              Source: {item.source}
            </span>
          )}

          {item.actions && item.actions.length > 0 && (
            <div className="flex shrink-0 items-center gap-[var(--space-3)]">
              {item.actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={(event) => {
                    action.onClick?.(event);
                    if (action.dismissOnClick) onDismiss?.(item.id);
                  }}
                  className={`${ACTION_BTN_BASE} ${
                    action.primary ? ACTION_BTN_PRIMARY : ACTION_BTN_SECONDARY
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export function NotificationCenter({
  items,
  title = "NOTIFICATIONS",
  onDismiss,
  onClearAll,
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  showPointer = true,
  emptyMessage = "새 알림 없음",
  className = "",
}: NotificationCenterProps) {
  // 컨트롤드/언컨트롤드 모두 지원: onDismiss가 없으면 내부 상태로 직접 제거.
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const visible = items.filter((it) => !dismissed.has(it.id));

  const handleDismiss = (id: string) => {
    if (onDismiss) onDismiss(id);
    else setDismissed((prev) => new Set(prev).add(id));
  };

  // clear-all: 비제어 모드면 보이는 항목 전부 내부 dismiss + 콜백.
  const handleClearAll = () => {
    if (!onDismiss) {
      setDismissed((prev) => {
        const next = new Set(prev);
        visible.forEach((it) => next.add(it.id));
        return next;
      });
    }
    onClearAll?.();
  };

  // 헤더 ▼ 버튼: 팝업 닫기. 제어 모드면 부모(onOpenChange)에 위임, 아니면 내부 상태로 닫음.
  const handleHide = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
  };

  // 표시 여부는 open 하나로만 결정 (비어 있어도 '새 알림 없음'을 보여줘 상태 desync 방지).
  if (!open) return null;

  return (
    <section
      role="region"
      aria-label={title}
      className={`fixed right-[var(--space-3)] bottom-[calc(var(--statusbar-height)_+_var(--space-3))]
                  z-[var(--z-notification)] w-[450px] max-w-[calc(100vw_-_2*var(--space-3))]${
                    className ? ` ${className}` : ""
                  }`}
    >
      <div
        className="flex flex-col overflow-hidden rounded-[var(--radius-md)]
                   border border-[var(--vscode-notifications-border)]
                   bg-[var(--vscode-notifications-background)] shadow-[var(--shadow-notification)]"
      >
        {/* 헤더 */}
        <header
          className="flex h-[35px] shrink-0 items-center justify-between gap-[var(--space-4)]
                   border-b border-[var(--vscode-notifications-border)] pl-[var(--space-5)] pr-[var(--space-3)]"
        >
          <span className="select-none text-[var(--font-size-sm)] uppercase tracking-[0.04em] text-[var(--vscode-sidebar-foreground)]">
            {title}
          </span>
          <div className="flex items-center gap-[var(--space-1)]">
            <HeaderButton
              label="Clear All Notifications"
              icon="codicon-clear-all"
              onClick={handleClearAll}
            />
            <HeaderButton
              label="Toggle Do Not Disturb Mode"
              icon="codicon-bell-slash"
            />
            <HeaderButton
              label="Hide Notifications"
              icon="codicon-chevron-down"
              onClick={handleHide}
            />
          </div>
        </header>

        {/* 알림 목록 (비어 있으면 '새 알림 없음') */}
        <ul className="m-0 max-h-[60vh] list-none overflow-auto p-0">
          {visible.length === 0 ? (
            <li className="px-[var(--space-5)] py-[var(--space-5)] text-[var(--font-size-md)] text-[var(--vscode-descriptionForeground)]">
              {emptyMessage}
            </li>
          ) : (
            visible.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onDismiss={handleDismiss}
              />
            ))
          )}
        </ul>
      </div>

      {/* 상태표시줄(종 아이콘)에서 위로 솟는 꼬리(▲) — 가로 위치는 right 값으로 미세조정 */}
      {showPointer && (
        <>
          {/* 뒤: 테두리색 삼각형 */}
          <span
            aria-hidden="true"
            className="absolute right-[3px] top-[calc(100%_+_2px)] h-0 w-0
                       border-x-[5px] border-x-transparent
                       border-b-[5px] border-b-[color:var(--vscode-notifications-border)]"
          />
          {/* 앞: 배경색 삼각형 (1px 작게 겹쳐 테두리만 노출) */}
          <span
            aria-hidden="true"
            className="absolute right-[4px] top-[calc(100%_+_3px)] h-0 w-0
                       border-x-[4px] border-x-transparent
                       border-b-[4px] border-b-[color:var(--vscode-notifications-background)]"
          />
        </>
      )}
    </section>
  );
}
