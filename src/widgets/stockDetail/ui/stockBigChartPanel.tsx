"use client";

import { useState } from "react";
import { CapsuleToggle, Codicon, type CapsuleToggleOption } from "@/shared/ui";
import {
  changeColorClass,
  formatPrice,
  useRefreshCountdown,
} from "@/shared/lib";
import { useCurrencyStore, useFxStore } from "@/features/currency";
import { useKisStore } from "@/features/auth/model/kisStore";
import {
  getCandles,
  getMarketQuotes,
  toYahooSymbol,
  type MarketQuote,
} from "@/features/stocks";
import { getStockCandles } from "@/features/stocks/api";
import type { StockSummary } from "../model/types";
import { candlesToChartData, type ChartData } from "../model/chartData";
import { PriceChart, type ChartType } from "./priceChart";

interface StockBigChartPanelProps {
  stock: StockSummary;
}

/**
 * 봉 단위(캔들 간격) — Yahoo interval 로 매핑. 차트 자체 옵션이라
 * 리스트/상세의 등락률 분봉(공유 store)과는 별개로 차트에서만 제어한다.
 * 분 단위는 드롭다운에 접고(트뷰식), 일/주/월은 바로 누르는 버튼. (Yahoo 미지원: 120·240분·년봉 제외.)
 */
const MINUTE_OPTIONS: ReadonlyArray<CapsuleToggleOption<string>> = [
  { value: "1m", label: "1분" },
  { value: "5m", label: "5분" },
  { value: "15m", label: "15분" },
  { value: "30m", label: "30분" },
  { value: "60m", label: "1시간" },
];

const UNIT_OPTIONS: ReadonlyArray<CapsuleToggleOption<string>> = [
  { value: "1d", label: "일" },
  { value: "1wk", label: "주" },
  { value: "1mo", label: "월" },
];

/** 차트 모양 — PriceChart(lightweight-charts) 지원 7종. */
const CHART_TYPE_OPTIONS: Array<{
  type: ChartType;
  label: string;
  icon: string;
}> = [
  { type: "candles", label: "캔들", icon: "codicon-graph" },
  { type: "bar", label: "바", icon: "codicon-graph-scatter" },
  { type: "line", label: "라인", icon: "codicon-pulse" },
  { type: "stepline", label: "스텝 라인", icon: "codicon-graph-line" },
  { type: "area", label: "영역", icon: "codicon-graph" },
  { type: "baseline", label: "베이스라인", icon: "codicon-arrow-both" },
  { type: "column", label: "컬럼", icon: "codicon-graph-scatter" },
];

/** 이동평균선 기간 (모듈 상수 = 안정적 참조로 effect 재실행 방지). */
const MA_PERIODS = [5, 20, 60, 120];

/** 차트 자동 갱신 주기 (초) — 시세 리스트와 같은 주기 + 카운트다운. */
const REFRESH_SEC = 5;

const BE_SUPPORTED_INTERVALS = new Set(["1d", "1wk", "1mo"]);

const LIMIT_BY_INTERVAL: Record<string, number> = {
  "1d": 250,
  "1wk": 250,
  "1mo": 250,
};

type BeCandleInterval = "1d" | "1wk" | "1mo";

export function StockBigChartPanel({ stock }: StockBigChartPanelProps) {
  const [interval, setInterval] = useState("15m");
  // 드롭다운에 보일 분 단위 라벨용 — 일/주/월을 골라도 마지막 분 단위를 기억.
  const [lastMinute, setLastMinute] = useState("15m");
  const [chartType, setChartType] = useState<ChartType>("candles");
  const [menuOpen, setMenuOpen] = useState(false);
  const [intervalMenuOpen, setIntervalMenuOpen] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [error, setError] = useState(false);

  const currency = useCurrencyStore((s) => s.currency);
  const usdKrw = useFxStore((s) => s.usdKrw);
  const kisConnected = useKisStore((s) => s.connected);

  const symbol = toYahooSymbol(stock.code, stock.market);
  const shouldUseBeCandles =
    kisConnected &&
    Boolean(stock.stockId) &&
    BE_SUPPORTED_INTERVALS.has(interval);

  // 자동 갱신 폴링 (공통 훅). 종목/주기 바뀌면 즉시 재조회.
  // KIS 연동 + BE 지원 interval(일/주/월)은 BE 캔들 API를 우선 사용하고,
  // 비KIS/분봉/BE 실패·403은 Yahoo 캔들로 폴백한다.
  useRefreshCountdown(
    (isActive) => {
      const fetchCandles = async () => {
        try {
          if (shouldUseBeCandles) {
            return await getStockCandles(
              stock.stockId,
              interval as BeCandleInterval,
              LIMIT_BY_INTERVAL[interval] ?? 250,
            );
          }

          return await getCandles(symbol, interval);
        } catch {
          return await getCandles(symbol, interval);
        }
      };

      Promise.all([fetchCandles(), getMarketQuotes([symbol])])
        .then(([candles, quotes]) => {
          if (!isActive()) return;

          if (candles.length === 0) {
            setError(true);
            return;
          }

          setChartData(candlesToChartData(candles));
          setQuote(quotes[0] ?? null);
          setError(false);
        })
        .catch(() => {
          if (isActive()) setError(true);
        });
    },
    `${symbol}:${stock.stockId}:${interval}:${shouldUseBeCandles}`,
    REFRESH_SEC,
  );

  const last = chartData?.candles.at(-1);
  const up = last ? last.close >= (chartData?.baseValue ?? last.close) : true;
  const activeType =
    CHART_TYPE_OPTIONS.find((option) => option.type === chartType) ??
    CHART_TYPE_OPTIONS[0];

  // 분 단위가 활성일 때만 드롭다운 강조. 라벨은 마지막으로 고른 분 단위를 보여준다.
  const minuteActive = MINUTE_OPTIONS.some(
    (option) => option.value === interval,
  );
  const minuteLabel = (
    MINUTE_OPTIONS.find((option) => option.value === lastMinute) ??
    MINUTE_OPTIONS[0]
  ).label;

  const pickMinute = (value: string) => {
    setInterval(value);
    setLastMinute(value);
    setIntervalMenuOpen(false);
  };

  // 헤더 금액 — 선택 통화(강조) + 반대 통화(보조) 둘 다 표시.
  const otherCurrency = currency === "USD" ? "KRW" : "USD";
  const changePct =
    quote?.changePercent != null
      ? `${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%`
      : null;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-vscode-editor text-vscode-fg">
      <div className="flex shrink-0 items-end justify-between border-b border-vscode-border-panel px-5 py-3">
        <div className="min-w-0">
          {/* 1행: 종목명 + 코드 */}
          <div className="flex min-w-0 items-baseline gap-1.5">
            <h2 className="truncate text-[18px] font-semibold leading-tight text-vscode-fg">
              {stock.name}
            </h2>
            <span className="font-mono text-[12px] text-vscode-fg-desc">
              {stock.code}
            </span>
          </div>

          {/* 2행: 선택 통화 금액(강조) + 반대 통화 금액(보조) + 등락률 */}
          {quote?.price != null && (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-[20px] text-vscode-fg">
                {formatPrice(quote.price, stock.market, currency, usdKrw)}
              </span>
              <span className="font-mono text-[13px] text-vscode-fg-desc">
                {formatPrice(quote.price, stock.market, otherCurrency, usdKrw)}
              </span>
              {changePct != null && (
                <span
                  className={`font-mono text-[13px] ${changeColorClass(changePct)}`}
                >
                  {changePct}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {/* 봉 단위 — 분 단위는 드롭다운, 일/주/월은 버튼 (트뷰식). */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={intervalMenuOpen}
                title="봉 단위 (분)"
                onClick={() => setIntervalMenuOpen((open) => !open)}
                className={`flex h-6 cursor-pointer items-center gap-1 rounded-[3px] border border-vscode-border-input px-1.5 text-[12px] hover:bg-vscode-list-hover ${
                  minuteActive
                    ? "bg-vscode-list-active font-medium text-vscode-fg"
                    : "bg-vscode-editor text-vscode-fg-desc"
                }`}
              >
                <span>{minuteLabel}</span>
                <Codicon icon="codicon-chevron-down" size={12} />
              </button>

              {intervalMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-hidden
                    tabIndex={-1}
                    onClick={() => setIntervalMenuOpen(false)}
                    className="fixed inset-0 z-(--z-dropdown) cursor-default"
                  />
                  <div
                    role="menu"
                    className="absolute right-0 top-7 z-[calc(var(--z-dropdown)+1)] min-w-24 rounded-[5px] border border-vscode-border-menu bg-vscode-menu py-1 shadow-(--shadow-dropdown)"
                  >
                    {MINUTE_OPTIONS.map((option) => {
                      const active = option.value === interval;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="menuitemradio"
                          aria-checked={active}
                          onClick={() => pickMinute(option.value)}
                          className="flex h-6.5 w-full cursor-pointer items-center gap-2 px-2.5 text-left text-[13px] text-(--vscode-menu-foreground) hover:bg-(--vscode-menu-selectionBackground) hover:text-(--vscode-menu-selectionForeground)"
                        >
                          <span className="flex w-3.5 justify-center">
                            {active && (
                              <Codicon icon="codicon-check" size={13} />
                            )}
                          </span>
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <CapsuleToggle
              options={UNIT_OPTIONS}
              value={interval}
              onChange={setInterval}
            />
          </div>

          {/* 차트 모양 — 우리 디자인 드롭다운 (캔들/바/라인/영역…). */}
          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`차트 모양: ${activeType.label}`}
              title={`차트 모양: ${activeType.label}`}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-6 cursor-pointer items-center gap-1 rounded-[3px] border border-vscode-border-input bg-vscode-editor px-1.5 text-vscode-fg hover:bg-vscode-list-hover"
            >
              <Codicon icon={activeType.icon} size={15} />
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
                        className="flex h-6.5 w-full cursor-pointer items-center gap-2 px-2.5 text-left text-[13px] text-(--vscode-menu-foreground) hover:bg-(--vscode-menu-selectionBackground) hover:text-(--vscode-menu-selectionForeground)"
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
        {chartData ? (
          <PriceChart
            data={chartData}
            up={up}
            type={chartType}
            variant="full"
            movingAverages={MA_PERIODS}
            showVolume
            fitKey={`${symbol}:${interval}`}
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[13px] text-vscode-fg-desc">
            {error ? "차트 데이터를 불러오지 못했습니다." : "차트 불러오는 중…"}
          </div>
        )}
      </div>
    </div>
  );
}
