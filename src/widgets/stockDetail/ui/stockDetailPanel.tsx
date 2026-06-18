"use client";

import { useEffect, useMemo, useState } from "react";
import { Codicon } from "@/shared/ui";
import {
  changeColorClass,
  compact,
  compactKo,
  convertCurrency,
  formatPrice,
  nativeCurrency,
  parseVolume,
  type DisplayCurrency,
} from "@/shared/lib";
import {
  CurrencyToggle,
  useCurrencyStore,
  useFxStore,
} from "@/features/currency";
import { useTimeframeStore, type Timeframe } from "@/features/timeframe";
import { createPosition, usePositionsStore } from "@/entities/position";
import {
  getCandles,
  getMarketQuotes,
  toYahooSymbol,
  type Candle,
  type MarketQuote,
} from "@/features/stocks";
import type { StockSummary } from "../model/types";
import { buildChartData, candlesToChartData } from "../model/chartData";
import { PriceChart } from "./priceChart";

interface StockDetailPanelProps {
  stock: StockSummary;
  onClose: () => void;
  onOpenBigChart?: (stock: StockSummary) => void;
}

/** 상세 시세 자동 갱신 주기 (ms) — 리스트와 같은 주기. */
const REFRESH_MS = 5_000;

const MARKET_LABEL: Record<StockSummary["market"], string> = {
  DOMESTIC: "KOREA MARKET",
  OVERSEAS: "US MARKET",
};

function nowTime(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** 분봉 토글 → 그 기간의 등락률(%). 일간은 스냅샷 폴백 허용, 그 외는 라이브 quote 만. 없으면 null. */
function pctForTimeframe(
  quote: MarketQuote | null,
  snapPct: number,
  timeframe: Timeframe,
): number | null {
  switch (timeframe) {
    case "일간":
      return quote?.changePercent ?? snapPct;
    case "15분":
      return quote?.change15m ?? null;
    case "30분":
      return quote?.change30m ?? null;
  }
}

/**
 * 상세 지표. 등락률(change·changeRate)은 분봉 토글 기간 기준 — 리스트와 같은 값을 본다.
 * 기본 "일간"=전일 종가 대비(표준). 라이브 quote 없으면 일간만 스냅샷 폴백(그 외 기간은 "—").
 */
function buildMetrics(
  stock: StockSummary,
  quote: MarketQuote | null,
  timestamp: string,
  currency: DisplayCurrency,
  rate: number,
  timeframe: Timeframe,
) {
  const snapPrice = Number.parseFloat(stock.price) || 0;
  const snapPct = Number.parseFloat(stock.change) || 0;

  const price = quote?.price ?? snapPrice;
  const pct = pctForTimeframe(quote, snapPct, timeframe);
  const volume = quote?.volume ?? parseVolume(stock.volume);
  const tradedValue = price * volume;

  // 거래대금 — 달러는 영어식 접두($..B), 원화는 한국식 접미(..조원). 거래량(주식 수)은 항상 한국식.
  const native = nativeCurrency(stock.market);
  const valueNum = convertCurrency(tradedValue, native, currency, rate);
  const value =
    currency === "USD" ? `$${compact(valueNum)}` : `${compactKo(valueNum)}원`;

  // 변동액: 일간은 전일종가(있으면) 기준, 그 외 기간은 등락률로 역산. pct 없으면 "—".
  const DASH = "—";
  let change = DASH;
  let changeRate = DASH;
  if (pct != null) {
    const prevRef =
      timeframe === "일간"
        ? (quote?.previousClose ?? price / (1 + pct / 100))
        : price / (1 + pct / 100);
    const changeAbs = price - prevRef;
    change = `${changeAbs >= 0 ? "+" : "-"}${formatPrice(Math.abs(changeAbs), stock.market, currency, rate)}`;
    changeRate = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
  }

  return {
    current: formatPrice(price, stock.market, currency, rate),
    change,
    changeRate,
    volume: compactKo(volume),
    value,
    timestamp,
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
  const currency = useCurrencyStore((s) => s.currency);
  const usdKrw = useFxStore((s) => s.usdKrw);
  const timeframe = useTimeframeStore((s) => s.timeframe);

  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>(() => nowTime());

  const symbol = toYahooSymbol(stock.code, stock.market);

  // 라이브 시세 + 당일 1분봉 폴링 (종목 변경 시 재시작). effect 본문 동기 setState 없음(lint).
  useEffect(() => {
    let ignore = false;
    const tick = () => {
      Promise.all([getMarketQuotes([symbol]), getCandles(symbol, "1m")])
        .then(([quotes, cs]) => {
          if (ignore) return;
          setQuote(quotes[0] ?? null);
          if (cs.length) setCandles(cs);
          setUpdatedAt(nowTime());
        })
        .catch(() => {});
    };
    tick();
    const timer = window.setInterval(tick, REFRESH_MS);
    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, [symbol]);

  const pct = (quote?.changePercent ?? Number.parseFloat(stock.change)) || 0;
  const up = pct >= 0;
  const metrics = buildMetrics(
    stock,
    quote,
    updatedAt,
    currency,
    usdKrw,
    timeframe,
  );
  const added = positions.some((p) => p.id === stock.code);

  const fallbackChart = useMemo(
    () =>
      buildChartData(stock.code, Number.parseFloat(stock.price) || 0, up, "1D"),
    [stock.code, stock.price, up],
  );
  const chartData = useMemo(
    () =>
      candles && candles.length ? candlesToChartData(candles) : fallbackChart,
    [candles, fallbackChart],
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
            className="ml-1 flex cursor-pointer items-center rounded-xs text-vscode-fg-icon hover:bg-vscode-list-hover hover:text-vscode-fg"
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
        {/* 타이틀 + 통화 토글 ($/원, 글로벌). 패널이 좁아져도 종목명은 …로 줄이고 코드는 유지. */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="flex min-w-0 items-baseline gap-1.5 font-sans text-[20px] font-semibold leading-tight text-vscode-fg">
            <span className="truncate" title={stock.name}>
              {stock.name}
            </span>
            <span className="shrink-0 text-[14px] font-normal text-vscode-fg-desc">
              ({stock.code})
            </span>
          </h2>
          <CurrencyToggle className="mt-0.5 shrink-0" />
        </div>

        {/* 지표 JSON 블록 — key 는 한글, 등락률은 전일 종가 대비(당일) 표준. */}
        <div className="mt-3 font-mono text-[13px]">
          <div className="text-vscode-fg-desc">{"{"}</div>
          <MetricLine name="현재가" value={metrics.current} />
          <MetricLine
            name="등락"
            value={metrics.change}
            valueClass={changeColorClass(metrics.changeRate)}
          />
          <MetricLine name="등락률" value={metrics.changeRate} isString />
          <MetricLine name="거래량" value={metrics.volume} isString />
          <MetricLine name="거래대금" value={metrics.value} isString />
          <MetricLine name="갱신시각" value={metrics.timestamp} isString last />
          <div className="text-vscode-fg-desc">{"}"}</div>
        </div>

        {/* 차트 툴바 — 미니 차트는 타입 선택 없이 확장 버튼만 */}
        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            aria-label="차트 확장"
            title="차트 확장"
            onClick={() => onOpenBigChart?.(stock)}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3px] border border-vscode-border-input bg-vscode-editor text-vscode-fg-icon hover:bg-vscode-list-hover hover:text-vscode-fg"
          >
            <Codicon icon="codicon-screen-full" size={14} />
          </button>
        </div>

        {/* 차트 — 스파크라인(축·그리드 없는 미니 영역 차트), 실제 당일 1분봉 */}
        <PriceChart
          data={chartData}
          up={up}
          type="area"
          variant="sparkline"
          className="mt-2 h-24 w-full"
        />

        {/* 보유 목록 추가 (물타기) — 로그인 무관, 수기 입력. */}
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
          등락·등락률은 전일 종가 대비입니다. 거래대금은 현재가×거래량으로
          산출한 근사치입니다.
          <br />
          평단가 입력 시 물타기 시뮬레이션이 활성화됩니다.
          <br />
          시세는 지연 데이터이며 {REFRESH_MS / 1000}초마다 자동 갱신됩니다.
        </p>
      </div>
    </div>
  );
}
