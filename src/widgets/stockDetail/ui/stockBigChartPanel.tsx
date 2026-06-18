"use client";

import { useMemo, useState } from "react";
import { Codicon } from "@/shared/ui";
import { changeColorClass, formatByMarket, isUp } from "@/shared/lib";
import type { StockSummary } from "../model/types";
import { convertCandlesToChartData, type ChartRange } from "../model/chartData";
import { PriceChart, type ChartHover, type ChartType } from "./priceChart";
import { useQuery } from "@tanstack/react-query";
import { getStockCandles } from "@/features/stocks/api";

interface StockBigChartPanelProps {
  stock: StockSummary;
}

/** 확장 차트 타입 메뉴 — lightweight-charts가 지원하는 7종. */
const CHART_TYPE_OPTIONS: Array<{
  type: ChartType;
  label: string;
  icon: string;
}> = [
  { type: "bar", label: "바", icon: "codicon-graph-line" },
  { type: "candles", label: "캔들", icon: "codicon-graph" },
  { type: "line", label: "라인", icon: "codicon-pulse" },
  { type: "stepline", label: "스텝 라인", icon: "codicon-graph-line" },
  { type: "area", label: "영역", icon: "codicon-graph" },
  { type: "baseline", label: "베이스라인", icon: "codicon-arrow-both" },
  { type: "column", label: "컬럼", icon: "codicon-graph-scatter" },
];

/** 상단 기간 버튼 — 캡쳐처럼 일/주/월/년. */
const PERIODS: Array<{ range: ChartRange; label: string }> = [
  { range: "1D", label: "일" },
  { range: "1W", label: "주" },
  { range: "1M", label: "월" },
  { range: "1Y", label: "년" },
];

/** 이동평균선 기간 (모듈 상수 = 안정적 참조로 effect 재실행 방지). */
const MA_PERIODS = [5, 20, 60, 120];
const INTERVAL_BY_RANGE = {
  "1D": "1d",
  "1W": "1wk",
  "1M": "1mo",
  "3M": "1mo",
  "1Y": "1mo",
} as const;

const LIMIT_BY_RANGE = {
  "1D": 250,
  "1W": 250,
  "1M": 250,
  "3M": 250,
  "1Y": 365,
} as const;

export function StockBigChartPanel({ stock }: StockBigChartPanelProps) {
  const [range, setRange] = useState<ChartRange>("1D");
  const [chartType, setChartType] = useState<ChartType>("candles");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hover, setHover] = useState<ChartHover | null>(null);
  const up = isUp(stock.change);
  const { data: candles = [], isLoading } = useQuery({
    queryKey: ["stock-candles", stock.stockId, range],
    queryFn: () =>
      getStockCandles(
        stock.stockId,
        INTERVAL_BY_RANGE[range],
        LIMIT_BY_RANGE[range],
      ),
    enabled: Boolean(stock.stockId),
  });

  const chartData = useMemo(
    () => convertCandlesToChartData(candles),
    [candles],
  );
  const activeType =
    CHART_TYPE_OPTIONS.find((o) => o.type === chartType) ??
    CHART_TYPE_OPTIONS[1];

  // 크로스헤어가 가리키는 봉(없으면 마지막 봉) → 범례 OHLC
  const bar = hover?.open != null ? hover : chartData.candles.at(-1);
  const close = hover?.value ?? bar?.close;
  const ohlcColor =
    (close ?? 0) >= (bar?.open ?? 0) ? "var(--chart-up)" : "var(--chart-down)";

  return (
    <div className="flex h-full flex-col overflow-hidden bg-vscode-editor text-vscode-fg">
      <div className="flex shrink-0 items-center justify-between border-b border-vscode-border-panel px-5 py-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-vscode-fg-desc">
            <span>CHART</span>
            <span>{stock.code}.bigchart</span>
          </div>
          <div className="flex min-w-0 items-baseline gap-2">
            <h2 className="truncate text-[18px] font-semibold leading-tight text-vscode-fg">
              {stock.name}
            </h2>
            <span className="font-mono text-[12px] text-vscode-fg-desc">
              {stock.code}
            </span>
            <span className="font-mono text-[18px] text-vscode-fg">
              {stock.price}
            </span>
            <span
              className={`font-mono text-[12px] ${changeColorClass(stock.change)}`}
            >
              {stock.change}
            </span>
          </div>
        </div>

        {/* 상단 툴바 — 기간(일/주/월/년) + 차트 타입 선택 */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-0.5">
            {PERIODS.map((period) => {
              const active = period.range === range;
              return (
                <button
                  key={period.range}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRange(period.range)}
                  className={`h-6 w-7 rounded-[3px] text-[12px] ${
                    active
                      ? "bg-vscode-list-active text-vscode-fg"
                      : "text-vscode-fg-desc hover:bg-vscode-list-hover"
                  }`}
                >
                  {period.label}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-vscode-border-panel" />

          {/* 차트 타입 선택 — VSCode 드롭다운 메뉴 */}
          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-6 items-center gap-1.5 rounded-[3px] px-2 text-[12px] text-vscode-fg hover:bg-vscode-list-hover"
            >
              <Codicon icon={activeType.icon} size={14} />
              <span>{activeType.label}</span>
              <Codicon icon="codicon-chevron-down" size={12} />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-(--z-dropdown) cursor-default"
                />
                <div
                  role="menu"
                  className="absolute right-0 top-7 z-[calc(var(--z-dropdown)+1)] min-w-39 rounded-[5px] border border-vscode-border-menu bg-vscode-menu py-1 shadow-(--shadow-dropdown)"
                >
                  {CHART_TYPE_OPTIONS.map((option) => {
                    const active = option.type === chartType;
                    return (
                      <button
                        key={option.type}
                        type="button"
                        role="menuitemradio"
                        aria-checked={active}
                        onClick={() => {
                          setChartType(option.type);
                          setMenuOpen(false);
                        }}
                        className="flex h-6.5 w-full items-center gap-2 px-2.5 text-left text-[13px] text-(--vscode-menu-foreground) hover:bg-(--vscode-menu-selectionBackground) hover:text-(--vscode-menu-selectionForeground)"
                      >
                        <span className="flex w-3.5 justify-center">
                          {active && <Codicon icon="codicon-check" size={13} />}
                        </span>
                        <Codicon icon={option.icon} size={14} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 px-5 pb-4 pt-3">
        {/* 범례 — 크로스헤어 OHLC (커서 추종) */}
        <div className="pointer-events-none absolute left-7 top-5 z-10 flex items-center gap-2 font-mono text-[11px]">
          <span className="text-vscode-fg-desc">시</span>
          <span style={{ color: ohlcColor }}>
            {formatByMarket(bar?.open, stock.market)}
          </span>
          <span className="text-vscode-fg-desc">고</span>
          <span style={{ color: ohlcColor }}>
            {formatByMarket(bar?.high, stock.market)}
          </span>
          <span className="text-vscode-fg-desc">저</span>
          <span style={{ color: ohlcColor }}>
            {formatByMarket(bar?.low, stock.market)}
          </span>
          <span className="text-vscode-fg-desc">종</span>
          <span style={{ color: ohlcColor }}>
            {formatByMarket(close, stock.market)}
          </span>
        </div>
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center text-[12px] text-vscode-fg-desc">
            캔들 데이터를 불러오는 중입니다...
          </div>
        )}

        <PriceChart
          data={chartData}
          up={up}
          type={chartType}
          variant="full"
          movingAverages={MA_PERIODS}
          showVolume
          onHover={setHover}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
