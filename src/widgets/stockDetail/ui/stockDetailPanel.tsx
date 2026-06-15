"use client";

import { useMemo } from "react";
import { Codicon } from "@/shared/ui";
import {
  changeColorClass,
  compact,
  formatByMarket,
  isUp,
  parseVolume,
} from "@/shared/lib";
import { createPosition, usePositionsStore } from "@/entities/position";
import type { StockSummary } from "../model/types";
import { buildChartData } from "../model/chartData";
import { PriceChart } from "./priceChart";

interface StockDetailPanelProps {
  stock: StockSummary;
  onClose: () => void;
  onOpenBigChart?: (stock: StockSummary) => void;
}

const MARKET_LABEL: Record<StockSummary["market"], string> = {
  DOMESTIC: "KOREA MARKET",
  OVERSEAS: "US MARKET",
  COIN: "CRYPTO MARKET",
};

/** 시가총액은 가격×유통주식수라 파생 불가 → 종목별 목업값. */
const MARKET_CAP: Record<string, string> = {
  "005930": "444.20T",
  "000660": "137.10T",
  "035720": "23.40T",
  "373220": "113.05T",
  AAPL: "2.95T",
  NVDA: "2.34T",
  TSLA: "558.00B",
  BTC: "1.84P",
};

/** 종목 요약 → 상세 지표 (open/high/low/value 등은 현재가·등락률에서 파생). */
function buildMetrics(stock: StockSummary) {
  const price = Number.parseFloat(stock.price) || 0;
  const pct = Number.parseFloat(stock.change) || 0;
  const prevClose = price / (1 + pct / 100);
  const changeAbs = price - prevClose;
  const open = prevClose;
  const high = Math.max(open, price) * 1.0056;
  const low = Math.min(open, price) * 0.9981;
  const tradedValue = price * parseVolume(stock.volume);

  const num = (v: number) => formatByMarket(v, stock.market);
  const signed = (v: number) => `${v >= 0 ? "+" : ""}${num(v)}`;

  return {
    current: num(price),
    change: signed(changeAbs),
    changeRate: stock.change,
    open: num(open),
    high: num(high),
    low: num(low),
    volume: stock.volume,
    value: compact(tradedValue),
    marketCap: MARKET_CAP[stock.code] ?? "—",
    timestamp: "09:31:05",
  };
}

/** JSON 한 줄: `  key: value,` — 키는 디스크립션색, 값만 강조. */
function MetricLine({
  name,
  value,
  isString = false,
  valueClass,
  last = false,
}: {
  name: string;
  value: string;
  isString?: boolean;
  valueClass?: string;
  last?: boolean;
}) {
  return (
    <div className="whitespace-pre leading-[20px]">
      <span className="text-vscode-fg-desc">{`  ${name}: `}</span>
      <span
        className={
          valueClass ?? (isString ? "text-[#ce9178]" : "text-[#b5cea8]")
        }
      >
        {isString ? `"${value}"` : value}
      </span>
      {!last && <span className="text-vscode-fg-desc">,</span>}
    </div>
  );
}

export function StockDetailPanel({
  stock,
  onClose,
  onOpenBigChart,
}: StockDetailPanelProps) {
  const positions = usePositionsStore((s) => s.positions);
  const addPosition = usePositionsStore((s) => s.addPosition);

  const metrics = buildMetrics(stock);
  const up = isUp(stock.change);
  const added = positions.some((p) => p.id === stock.code);
  // 미니 스파크라인은 기간 전환 없이 고정 — 상세 기간/지표는 확장 차트에서.
  const chartData = useMemo(
    () =>
      buildChartData(stock.code, Number.parseFloat(stock.price) || 0, up, "1D"),
    [stock.code, stock.price, up],
  );

  const handleAdd = () => {
    if (added) return;
    addPosition(createPosition(stock));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden border-l border-vscode-border-sidebar bg-vscode-editor text-vscode-fg">
      {/* 탭 헤더 */}
      <div className="flex h-(--tabbar-height) shrink-0 items-center justify-between bg-vscode-tab-inactive pl-2 pr-1">
        <div className="flex items-center gap-1.5 border-t border-[var(--vscode-tab-activeBorderTop)] bg-vscode-tab-active px-2 py-1 text-[13px] text-vscode-fg-tab-active">
          <Codicon icon="codicon-graph-line" size={14} />
          <span>{stock.code}</span>
          <button
            type="button"
            className="tab-close ml-1 opacity-100"
            aria-label={`Close ${stock.code}`}
            onClick={onClose}
          >
            <Codicon icon="codicon-close" size={14} />
          </button>
        </div>
        <div className="flex items-center gap-0.5 text-vscode-fg-icon">
          <Codicon icon="codicon-split-horizontal" size={14} />
          <Codicon icon="codicon-ellipsis" size={14} />
        </div>
      </div>

      {/* 브레드크럼 */}
      <nav className="editor-breadcrumb">
        <span className="editor-breadcrumb-segment">
          <span>{MARKET_LABEL[stock.market]}</span>
          <Codicon icon="codicon-chevron-right" size={14} />
        </span>
        <span className="editor-breadcrumb-current">{stock.code}</span>
      </nav>

      <div className="flex-1 overflow-auto px-4 py-3">
        {/* 타이틀 */}
        <h2 className="font-sans text-[20px] font-semibold leading-tight text-vscode-fg">
          {stock.name}{" "}
          <span className="text-[14px] font-normal text-vscode-fg-desc">
            ({stock.code})
          </span>
        </h2>

        {/* 지표 JSON 블록 */}
        <div className="mt-3 font-mono text-[13px]">
          <div className="text-vscode-fg-desc">{"{"}</div>
          <MetricLine name="current" value={metrics.current} />
          <MetricLine
            name="change"
            value={metrics.change}
            valueClass={changeColorClass(stock.change)}
          />
          <MetricLine name="changeRate" value={metrics.changeRate} isString />
          <MetricLine name="open" value={metrics.open} />
          <MetricLine name="high" value={metrics.high} />
          <MetricLine name="low" value={metrics.low} />
          <MetricLine name="volume" value={metrics.volume} isString />
          <MetricLine name="value" value={metrics.value} isString />
          <MetricLine name="marketCap" value={metrics.marketCap} isString />
          <MetricLine
            name="timestamp"
            value={metrics.timestamp}
            isString
            last
          />
          <div className="text-vscode-fg-desc">{"}"}</div>
        </div>

        {/* 차트 툴바 — 미니 차트는 타입 선택 없이 확장 버튼만 */}
        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            aria-label="전체 화면"
            onClick={() => onOpenBigChart?.(stock)}
            className="flex h-6 w-6 items-center justify-center rounded-[3px] text-vscode-fg-icon hover:bg-vscode-list-hover"
          >
            <Codicon icon="codicon-screen-full" size={14} />
          </button>
        </div>

        {/* 차트 — 스파크라인(축·그리드 없는 미니 영역 차트) */}
        <PriceChart
          data={chartData}
          up={up}
          type="area"
          variant="sparkline"
          className="mt-2 h-24 w-full"
        />

        {/* 보유 목록 추가 */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={added}
          className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-[3px] py-1.5 text-[12px] ${
            added
              ? "cursor-default bg-vscode-list-active text-vscode-fg"
              : "bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]"
          }`}
        >
          <Codicon icon={added ? "codicon-check" : "codicon-add"} size={14} />
          {added
            ? "보유 목록에 있음 · 평단가 입력"
            : "보유 목록에 입력 · 평단가 입력"}
        </button>

        <p className="mt-2 text-[11px] leading-relaxed text-[var(--vscode-disabledForeground)]">
          평단가 입력 시 물타기 시뮬레이션이 활성화됩니다. 시세는 지연
          데이터이며 자동 갱신됩니다.
        </p>
      </div>
    </div>
  );
}
