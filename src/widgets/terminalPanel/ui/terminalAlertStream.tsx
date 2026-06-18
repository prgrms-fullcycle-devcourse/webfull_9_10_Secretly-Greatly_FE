"use client";

/**
 * TerminalAlertStream — 실시간 급변 알림 로그 스트림 뷰 (순수 표현 컴포넌트).
 *
 * 하단 패널 `TERMINAL` 탭에서 주입된 `logs` 를 무한 스크롤 로그처럼 출력한다.
 * 데이터는 전적으로 `logs` prop 으로 주입받으며(소켓 연동), 자체 상태/타이머는 없다.
 * 색상/간격은 모두 `tokens.css` 디자인 토큰을 사용하고, 스타일은 Tailwind 우선.
 */

import { useEffect, useRef } from "react";

export type TerminalLogLevel = "INFO" | "WARN" | "ALERT" | "CRITICAL";

export interface TerminalLog {
  id: string;
  /** "HH:MM:SS" (빈 문자열이면 시각 표기 생략) */
  time: string;
  level: TerminalLogLevel;
  /** 본문 텍스트 (알림은 서버 formattedLog, 안내/오류 줄은 소스 라벨). */
  label: string;
  /** label 뒤에 덧붙일 부가 문구(안내/오류 메시지 등). */
  note?: string;
}

const LEVEL_CLASS: Record<TerminalLogLevel, string> = {
  INFO: "text-terminal-cyan",
  WARN: "text-(--vscode-notificationsWarningIcon-foreground)",
  ALERT: "text-(--vscode-notificationsErrorIcon-foreground)",
  CRITICAL: "text-(--vscode-notificationsErrorIcon-foreground)",
};

/* ── 한 줄 ─────────────────────────────────────────────── */
function LogRow({ log }: { log: TerminalLog }) {
  return (
    <div className="flex gap-2 leading-[18px]">
      {log.time && (
        <span className="shrink-0 text-vscode-fg-desc">[{log.time}]</span>
      )}
      <span
        className={`w-[68px] shrink-0 font-semibold ${LEVEL_CLASS[log.level]}`}
      >
        {log.level}
      </span>
      <span className="min-w-0 text-terminal-fg">
        {log.label}
        {log.note ? ` ${log.note}` : ""}
      </span>
    </div>
  );
}

export interface TerminalAlertStreamProps {
  /** 출력할 로그(소켓에서 매핑되어 주입). */
  logs: TerminalLog[];
}

export function TerminalAlertStream({ logs }: TerminalAlertStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(true);

  // 새 줄이 추가될 때만 자동 스크롤(바닥 근처일 때). logs 는 매 렌더 새 참조라
  // [logs] 는 매 렌더 실행되므로, "마지막 줄 id" 변화로 좁힌다(누적 상한 후에도 정확).
  const lastLogKey = logs.length > 0 ? logs[logs.length - 1].id : null;
  useEffect(() => {
    const el = scrollRef.current;
    if (el && followRef.current) el.scrollTop = el.scrollHeight;
  }, [lastLogKey]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    followRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-label="Realtime alert stream"
      className="h-full overflow-auto pb-1 pr-2 font-mono"
    >
      {logs.map((log) => (
        <LogRow key={log.id} log={log} />
      ))}
    </div>
  );
}
