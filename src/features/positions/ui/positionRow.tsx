"use client";

/**
 * PositionRow — 보유 종목 한 줄.
 *
 * 평단가/수량은 인라인 편집 가능하며, 행을 클릭하면 아래로 펼쳐지며
 * 물타기 시뮬레이터(`DcaSimulator`)가 나타난다.
 */

import { useState } from "react";
import { Codicon } from "@/shared/ui";
import { usePositionsStore, type Position } from "@/entities/position";
import { getPositionMetrics } from "../model/metrics";
import {
  formatAmount,
  formatPct,
  formatProfit,
  profitColorClass,
} from "../model/format";
import { DcaSimulator } from "./dcaSimulator";

/** 헤더/행이 공유하는 컬럼 그리드 (정렬 일치용). */
export const POSITION_GRID =
  "grid grid-cols-[minmax(180px,1.6fr)_minmax(96px,1fr)_minmax(70px,0.7fr)_minmax(96px,1fr)_minmax(112px,1.1fr)_minmax(104px,1fr)_minmax(84px,0.8fr)_28px] items-center gap-x-3";

const cellInput =
  "h-7 w-full rounded-(--radius-xs) border border-(--vscode-input-border) bg-(--vscode-input-background) px-2 text-right font-mono text-(length:--font-size-md) text-(--vscode-input-foreground) outline-none focus:border-(--vscode-focus)";

export function PositionRow({ position }: { position: Position }) {
  const [expanded, setExpanded] = useState(false);
  const updatePosition = usePositionsStore((state) => state.updatePosition);
  const removePosition = usePositionsStore((state) => state.removePosition);

  const { marketValue, profit, profitRate } = getPositionMetrics(position);

  return (
    <div className="border-b border-vscode-border-panel/60">
      {/* 행 */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
        data-expanded={expanded}
        className={`${POSITION_GRID} cursor-pointer px-6 py-2 text-(length:--font-size-md) transition-colors hover:bg-(--vscode-list-hoverBackground) data-[expanded=true]:bg-(--vscode-list-activeSelectionBackground)`}
      >
        {/* 종목 */}
        <div className="flex min-w-0 items-center gap-2">
          <Codicon
            icon={expanded ? "codicon-chevron-down" : "codicon-chevron-right"}
            size={14}
            className="shrink-0 text-vscode-fg-icon"
          />
          <span className="truncate font-sans font-medium text-vscode-fg">
            {position.name}
          </span>
          <span className="shrink-0 font-mono text-(length:--font-size-sm) text-vscode-fg-desc">
            {position.ticker}
          </span>
        </div>

        {/* 평단가 (편집) */}
        <input
          type="number"
          inputMode="numeric"
          aria-label="평단가"
          value={Number.isFinite(position.avgPrice) ? position.avgPrice : ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            updatePosition(position.id, {
              avgPrice: Number.isFinite(e.target.valueAsNumber)
                ? e.target.valueAsNumber
                : 0,
            })
          }
          className={cellInput}
        />

        {/* 수량 (편집) */}
        <input
          type="number"
          inputMode="numeric"
          aria-label="수량"
          value={Number.isFinite(position.quantity) ? position.quantity : ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            updatePosition(position.id, {
              quantity: Number.isFinite(e.target.valueAsNumber)
                ? e.target.valueAsNumber
                : 0,
            })
          }
          className={cellInput}
        />

        {/* 현재가 */}
        <span className="text-right font-mono text-vscode-fg">
          {formatAmount(position.currentPrice, position.currency)}
        </span>

        {/* 평가액 */}
        <span className="text-right font-mono text-vscode-fg">
          {formatAmount(marketValue, position.currency)}
        </span>

        {/* 평가손익 */}
        <span className={`text-right font-mono ${profitColorClass(profit)}`}>
          {formatProfit(profit, position.currency)}
        </span>

        {/* 수익률 */}
        <span
          className={`text-right font-mono ${profitColorClass(profitRate)}`}
        >
          {formatPct(profitRate)}
        </span>

        {/* 삭제 */}
        <button
          type="button"
          aria-label={`${position.name} 삭제`}
          onClick={(e) => {
            e.stopPropagation();
            removePosition(position.id);
          }}
          className="flex h-6 w-6 items-center justify-center justify-self-end rounded-(--radius-xs) text-vscode-fg-icon hover:bg-(--vscode-list-hoverBackground)"
        >
          <Codicon icon="codicon-trash" size={14} />
        </button>
      </div>

      {/* 펼침: 물타기 시뮬레이터 */}
      {expanded && (
        <DcaSimulator
          code={position.ticker.split(".")[0]}
          currentAvgPrice={position.avgPrice}
          currentQuantity={position.quantity}
          currentPrice={position.currentPrice}
        />
      )}
    </div>
  );
}
