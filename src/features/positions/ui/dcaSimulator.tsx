"use client";

/**
 * DcaSimulator — 포지션 행을 펼치면 나오는 '물타기'(추가 매수) 시뮬레이터.
 *
 * 평단가/보유수량/현재가/코드는 포지션에서 주입받고, 추가 매수가/수량만 입력한다.
 * [물타기 계산] 클릭 시 BE 보정 엔진(`simulateDca`)을 호출하고, 응답의 `formattedLog`
 * 문자열을 에디터 하단 최적화 로그처럼 아래로 누적 출력한다.
 *
 * 입력값 변경만으로는 BE를 호출하지 않는다(네트워크 절약). 계산은 버튼이 트리거한다.
 */

import { useCallback, useState } from "react";
import { Codicon } from "@/shared/ui";
import { simulateDca } from "../api/simulateDca";
import type { DcaSimulateRequest } from "../model/types";

interface DcaSimulatorProps {
  /** 종목 코드 (예: "NVDA") */
  code: string;
  currentAvgPrice: number;
  currentQuantity: number;
  /** 현재가 (목 전용 — BE 연동 시 서버가 시세를 채움) */
  currentPrice: number;
}

const DEFAULT_ADD_QUANTITY = 1;

/** 결과가 아직 없을 때(패널 첫 진입) 노출하는 안내 문구. 서버 호출과 무관. */
const EMPTY_HINT =
  "[Optimizer Info] 추가 매수가·수량을 입력한 뒤 [물타기 계산]을 눌러주세요.";

const inputClass =
  "h-7 w-full rounded-(--radius-xs) border border-(--vscode-input-border) bg-(--vscode-input-background) px-2 text-right font-mono text-(length:--font-size-md) text-(--vscode-input-foreground) outline-none focus:border-(--vscode-focus)";

interface LogEntry {
  text: string;
  /** 401/404 등 BE 에러 줄 — 빨간색으로 표시. */
  isError?: boolean;
}

function LogLine({ text, isError }: LogEntry) {
  const idx = text.indexOf("] ");
  const tag = idx >= 0 ? text.slice(0, idx + 1) : "";
  const body = idx >= 0 ? text.slice(idx + 2) : text;
  return (
    <div className="flex gap-2">
      {tag && (
        <span
          className={`shrink-0 ${isError ? "text-(--vscode-errorForeground)" : "text-terminal-cyan"}`}
        >
          {tag}
        </span>
      )}
      <span
        className={
          isError ? "text-(--vscode-errorForeground)" : "text-vscode-fg-editor"
        }
      >
        {body}
      </span>
    </div>
  );
}

export function DcaSimulator({
  code,
  currentAvgPrice,
  currentQuantity,
  currentPrice,
}: DcaSimulatorProps) {
  const [addPrice, setAddPrice] = useState(currentPrice);
  const [addQuantity, setAddQuantity] = useState(DEFAULT_ADD_QUANTITY);
  const [pending, setPending] = useState(false);

  const buildRequest = useCallback(
    (price: number, qty: number): DcaSimulateRequest => ({
      code,
      currentAvgPrice,
      currentQuantity,
      purchasePrice: price,
      purchaseQuantity: qty,
    }),
    [code, currentAvgPrice, currentQuantity],
  );

  // 결과는 [물타기 계산] 클릭 시에만 채운다. 비어 있을 땐 안내 문구만 노출.
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const run = useCallback(async () => {
    setPending(true);
    try {
      const result = await simulateDca(buildRequest(addPrice, addQuantity));
      setLogs((prev) => [...prev, { text: result.formattedLog }]);
    } catch (err) {
      // apiClient 인터셉터가 BE 메시지를 error.message 로 실어준다.
      // 401(인증 필요)·404(보유 자산 없음) 등을 그대로 로그 패널에 노출한다.
      const message =
        (err as { message?: string })?.message ??
        "시뮬레이션 요청에 실패했습니다. 잠시 후 다시 시도해주세요.";
      setLogs((prev) => [
        ...prev,
        { text: `[Optimizer Error] ${message}`, isError: true },
      ]);
    } finally {
      setPending(false);
    }
  }, [buildRequest, addPrice, addQuantity]);

  const toNumber = (value: number) => (Number.isFinite(value) ? value : 0);

  return (
    <div className="flex flex-col gap-4 border-t border-vscode-border-panel bg-vscode-editor px-6 py-4 font-sans">
      {/* 입력 줄 */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex items-center gap-2">
          <Codicon
            icon="codicon-symbol-operator"
            size={14}
            className="text-terminal-cyan"
          />
          <span className="text-(length:--font-size-md) font-semibold text-terminal-cyan">
            물타기 시뮬레이션
          </span>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-(length:--font-size-sm) text-vscode-fg-desc">
            추가 매수가
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              inputMode="numeric"
              value={Number.isFinite(addPrice) ? addPrice : ""}
              onChange={(e) => setAddPrice(toNumber(e.target.valueAsNumber))}
              className={`${inputClass} w-32`}
            />
            <button
              type="button"
              onClick={() => setAddPrice(currentPrice)}
              className="h-7 shrink-0 rounded-(--radius-xs) bg-(--vscode-button-secondaryBackground) px-2 text-(length:--font-size-sm) text-(--vscode-button-secondaryForeground) hover:bg-(--vscode-button-secondaryHoverBackground)"
            >
              현재가
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-(length:--font-size-sm) text-vscode-fg-desc">
            추가 매수량
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={Number.isFinite(addQuantity) ? addQuantity : ""}
            onChange={(e) => setAddQuantity(toNumber(e.target.valueAsNumber))}
            className={`${inputClass} w-24`}
          />
        </label>

        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="inline-flex h-7 items-center gap-1.5 rounded-(--radius-xs) bg-(--vscode-button-background) px-3 text-(length:--font-size-md) text-(--vscode-button-foreground) transition-colors hover:bg-(--vscode-button-hoverBackground) disabled:opacity-60"
        >
          <Codicon icon="codicon-play" size={12} />
          {pending ? "계산 중…" : "물타기 계산"}
        </button>
      </div>

      {/* 옵티마이저 로그 (BE formattedLog 누적) */}
      <div className="rounded-(--radius-sm) border border-vscode-border-panel bg-vscode-window p-4 font-mono text-(length:--font-size-md) leading-[22px]">
        {logs.length === 0 && !pending && <LogLine text={EMPTY_HINT} />}
        {logs.map((line, i) => (
          <LogLine key={i} text={line.text} isError={line.isError} />
        ))}
        {pending && (
          <div className="flex gap-2 opacity-70">
            <span className="shrink-0 text-terminal-cyan">
              [Optimizer Info]
            </span>
            <span className="text-vscode-fg-desc">
              Optimizing &apos;{code}&apos; thread…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
