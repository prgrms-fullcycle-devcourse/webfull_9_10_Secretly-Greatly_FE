"use client";

/**
 * TerminalAlertStream — 즐겨찾기 한정 경고 알림 로그 스트림 뷰.
 *
 * 하단 패널 `TERMINAL` 탭 안에서, AI 에이전트가 백그라운드로 자산을 분석해
 * 경고를 인젝션하는 모습을 모방한 무한 스크롤 로그 스트림입니다.
 *
 * - 순수 표현 컴포넌트: 실제 데이터는 `logs` prop으로 주입(소켓 연결 시 교체).
 *   prop이 없으면 데모용 목 스트림이 일정 간격으로 흐릅니다.
 * - 색상/간격은 모두 `tokens.css` 디자인 토큰을 사용하고, 스타일은 Tailwind 우선.
 */

import { useEffect, useRef, useState } from "react";

export type TerminalLogLevel = "INFO" | "WARN" | "ALERT" | "CRITICAL";

export interface TerminalLog {
  id: string;
  /** "HH:MM:SS" */
  time: string;
  level: TerminalLogLevel;
  /** 종목/포지션 라벨 (예: "삼성전자 (005930.KS)") */
  label: string;
  /** 현재가 등 부가 값 (예: "74,500") */
  value?: string;
  /** 등락률(%) — 부호로 ▲/▼ 및 색상 결정 */
  change?: number;
  /** 값/등락률 대신 보여줄 경고 문구 (예: "거래량 급증 (평소 대비 150%)") */
  note?: string;
}

const LEVEL_CLASS: Record<TerminalLogLevel, string> = {
  INFO: "text-terminal-cyan",
  WARN: "text-(--vscode-notificationsWarningIcon-foreground)",
  ALERT: "text-(--vscode-notificationsErrorIcon-foreground)",
  CRITICAL: "text-(--vscode-notificationsErrorIcon-foreground)",
};

// 상승/하락색은 앱 전체와 통일 (시안 / 빨강)
const UP_CLASS = "text-terminal-cyan";
const DOWN_CLASS = "text-(--vscode-editorGutter-deletedBackground)";

/* ── 데모용 목 데이터 ──────────────────────────────────── */
const SEED_LOGS: TerminalLog[] = [
  {
    id: "s1",
    time: "09:31:02",
    level: "INFO",
    label: "삼성전자 (005930.KS)",
    value: "74,500",
    change: 1.08,
  },
  {
    id: "s2",
    time: "09:31:02",
    level: "INFO",
    label: "SK하이닉스 (000660.KS)",
    value: "188,300",
    change: -0.62,
  },
  {
    id: "s3",
    time: "09:31:05",
    level: "INFO",
    label: "NVIDIA Corp. (NVDA.US)",
    value: "949.50",
    change: 1.3,
  },
  {
    id: "s4",
    time: "09:31:07",
    level: "INFO",
    label: "Apple Inc. (AAPL.US)",
    value: "189.84",
    change: 0.78,
  },
  {
    id: "s5",
    time: "09:31:11",
    level: "WARN",
    label: "Tesla, Inc. (TSLA.US)",
    value: "175.43",
    change: -1.21,
  },
  {
    id: "s7",
    time: "09:31:20",
    level: "ALERT",
    label: "삼성전자 (005930.KS)",
    note: "거래량 급증 (평소 대비 150%)",
  },
  {
    id: "s8",
    time: "09:31:25",
    level: "ALERT",
    label: "SK하이닉스 (000660.KS)",
    note: "5분 내 -2% 하락",
  },
];

const WATCHLIST = [
  { label: "삼성전자 (005930.KS)", base: 74500 },
  { label: "SK하이닉스 (000660.KS)", base: 188300 },
  { label: "NVIDIA Corp. (NVDA.US)", base: 949.5 },
  { label: "Apple Inc. (AAPL.US)", base: 189.84 },
  { label: "Tesla, Inc. (TSLA.US)", base: 175.43 },
];

function nowTime(): string {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

function randomLog(seq: number): TerminalLog {
  const t = WATCHLIST[Math.floor(Math.random() * WATCHLIST.length)];
  const change = Number((Math.random() * 5 - 2.5).toFixed(2));
  const abs = Math.abs(change);
  const level: TerminalLogLevel =
    abs >= 2 ? "ALERT" : abs >= 1 ? "WARN" : "INFO";
  const price = Math.round(t.base * (1 + change / 100));
  return {
    id: `g${seq}`,
    time: nowTime(),
    level,
    label: t.label,
    value: price.toLocaleString("en-US"),
    change,
  };
}

const MAX_LOGS = 200;

/* ── 한 줄 ─────────────────────────────────────────────── */
function LogRow({ log }: { log: TerminalLog }) {
  const hasChange = typeof log.change === "number";
  return (
    <div className="flex gap-2 leading-[18px]">
      <span className="shrink-0 text-vscode-fg-desc">[{log.time}]</span>
      <span
        className={`w-[44px] shrink-0 font-semibold ${LEVEL_CLASS[log.level]}`}
      >
        {log.level}
      </span>
      <span className="min-w-0 text-terminal-fg">
        {log.label}
        {log.value ? ` ${log.value}` : ""}
        {hasChange && (
          <span className={log.change! >= 0 ? UP_CLASS : DOWN_CLASS}>
            {" "}
            {log.change! >= 0 ? "▲" : "▼"} {log.change! >= 0 ? "+" : ""}
            {log.change!.toFixed(2)}%
          </span>
        )}
        {log.note ? ` ${log.note}` : ""}
      </span>
    </div>
  );
}

export interface TerminalAlertStreamProps {
  /** 외부에서 주입할 로그(소켓 연동 시). 없으면 데모 스트림 자동 재생. */
  logs?: TerminalLog[];
}

export function TerminalAlertStream({
  logs: logsProp,
}: TerminalAlertStreamProps) {
  const isControlled = logsProp !== undefined;
  const [internalLogs, setInternalLogs] = useState<TerminalLog[]>(SEED_LOGS);
  const logs = isControlled ? logsProp : internalLogs;

  const scrollRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(true);
  const seqRef = useRef(0);

  // 데모 스트림: 비제어 모드에서만 일정 간격으로 새 로그 인서트.
  useEffect(() => {
    if (isControlled) return;
    const id = window.setInterval(() => {
      setInternalLogs((prev) => {
        const next = [...prev, randomLog(seqRef.current++)];
        return next.length > MAX_LOGS ? next.slice(-MAX_LOGS) : next;
      });
    }, 2500);
    return () => window.clearInterval(id);
  }, [isControlled]);

  // 새 로그가 들어오면 (사용자가 바닥 근처일 때만) 자동 스크롤.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && followRef.current) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    followRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };

  return (
    <div className="flex h-full min-h-0 flex-col font-mono">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Watchlist alert stream"
        className="min-h-0 flex-1 overflow-auto pb-1 pr-2"
      >
        {logs.map((log) => (
          <LogRow key={log.id} log={log} />
        ))}
      </div>

      {/* 푸터: 즐겨찾기 알림 스트림 요약 (패널 좌우 패딩 상쇄해 full-bleed) */}
      <footer className="-mx-5 shrink-0 border-t border-vscode-border-panel px-5 py-1 text-(length:--font-size-md) text-vscode-fg-desc">
        <span className="text-(--vscode-notificationsWarningIcon-foreground)">
          ★
        </span>{" "}
        favorites alert stream
        <span className="opacity-50"> · </span>005930.KS, NVDA.US
        <span className="opacity-50"> · </span>15m ±2.0% → WARN, 30m ±3.0% →
        CRITICAL
      </footer>
    </div>
  );
}
