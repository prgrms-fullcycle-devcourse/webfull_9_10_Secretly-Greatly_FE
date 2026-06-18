"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconButton,
  RefreshCountdown,
  SegmentFilter,
  Select,
  type SelectOption,
} from "@/shared/ui";
import { getStoredSession } from "@/shared/api";
import {
  changeColorClass,
  compactKo,
  convertCurrency,
  formatPrice,
  nativeCurrency,
  parseVolume,
  useRefreshCountdown,
  type DisplayCurrency,
} from "@/shared/lib";
import { createPosition, usePositionsStore } from "@/entities/position";
import { useFavoritesStore } from "@/features/favorites";
import {
  CurrencyToggle,
  useCurrencyStore,
  useFxStore,
} from "@/features/currency";
import {
  TimeframeToggle,
  useTimeframeStore,
  type Timeframe,
} from "@/features/timeframe";
import {
  getMarketQuotes,
  toYahooSymbol,
  type MarketQuote,
} from "@/features/stocks";
import { useWatchlistStore, type WatchlistItem } from "@/features/watchlist";
import type { StockSummary } from "@/widgets/stockDetail";

interface StocksSheetPanelProps {
  filename: string;
  /** 종목 행 클릭 시 상세 패널을 여는 콜백. */
  onSelectStock?: (stock: StockSummary) => void;
  /** 현재 상세 패널에 열려 있는 종목 코드 (행 강조용). */
  selectedCode?: string | null;
}

type MarketKey = "ALL" | "DOMESTIC" | "OVERSEAS";
type SortKey = "default" | "price" | "volume" | "change";

interface StockRow {
  stockId?: number;
  code: string;
  name: string;
  priceRaw: number | null;
  pctDay: number | null;
  pct15m: number | null;
  pct30m: number | null;
  volume: string;
  market: Exclude<MarketKey, "ALL">;
}

const MARKET_OPTIONS: Array<{ value: MarketKey; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "DOMESTIC", label: "국장" },
  { value: "OVERSEAS", label: "미장" },
];

const SORT_OPTIONS: ReadonlyArray<SelectOption<SortKey>> = [
  { value: "default", label: "등록순" },
  { value: "price", label: "현재가" },
  { value: "volume", label: "거래량" },
  { value: "change", label: "등락률" },
];

let lastSortKey: SortKey = "default";

const NO_VALUE = "—";
const REFRESH_SEC = 5;

let cachedRows: StockRow[] = [];

function toYahooRow(
  stock: WatchlistItem,
  quote: MarketQuote | undefined,
): StockRow {
  return {
    stockId: stock.stockId,
    code: stock.code,
    name: stock.name,
    market: stock.market,
    priceRaw: quote?.price ?? null,
    pctDay: quote?.changePercent ?? null,
    pct15m: quote?.change15m ?? null,
    pct30m: quote?.change30m ?? null,
    volume: quote?.volume == null ? NO_VALUE : compactKo(quote.volume),
  };
}

function pctForTimeframe(row: StockRow, timeframe: Timeframe): number | null {
  switch (timeframe) {
    case "일간":
      return row.pctDay;
    case "15분":
      return row.pct15m;
    case "30분":
      return row.pct30m;
  }
}

function formatPct(pct: number | null): string {
  return pct == null ? NO_VALUE : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

function getMarketFromFilename(filename: string): MarketKey {
  const prefix = filename.replace(".sheet", "").toUpperCase();
  return prefix === "DOMESTIC" || prefix === "OVERSEAS" ? prefix : "ALL";
}

function getSortValue(
  stock: StockRow,
  sortKey: SortKey,
  currency: DisplayCurrency,
  rate: number,
  timeframe: Timeframe,
): number {
  if (sortKey === "price") {
    return stock.priceRaw == null
      ? Number.NEGATIVE_INFINITY
      : convertCurrency(
          stock.priceRaw,
          nativeCurrency(stock.market),
          currency,
          rate,
        );
  }

  if (sortKey === "volume") {
    return stock.volume === NO_VALUE
      ? Number.NEGATIVE_INFINITY
      : parseVolume(stock.volume);
  }

  return pctForTimeframe(stock, timeframe) ?? Number.NEGATIVE_INFINITY;
}

const CODE_COLS = "minmax(0,260px) 150px 140px auto";

function LineNumber({ value }: { value: number }) {
  return (
    <span className="w-(--gutter-width) shrink-0 select-none pr-[14px] text-right text-vscode-line-number">
      {value}
    </span>
  );
}

function CodeLine({
  line,
  children,
  onClick,
  selected = false,
  flash = false,
  onFlashEnd,
}: {
  line: number;
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  flash?: boolean;
  onFlashEnd?: () => void;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onAnimationEnd={flash ? onFlashEnd : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`flex min-h-[22px] leading-[22px] ${flash ? "animate-row-flash" : ""} ${
        onClick ? "cursor-pointer" : ""
      } ${selected ? "bg-vscode-list-active" : "hover:bg-vscode-list-hover"}`}
    >
      <LineNumber value={line} />
      <div className="min-w-0 flex-1 pr-4">{children}</div>
    </div>
  );
}

function Field({
  name,
  value,
  valueClass,
  prefix = "",
  suffix = ",",
}: {
  name: string;
  value: string;
  valueClass: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <span className="truncate whitespace-pre">
      <span className="text-vscode-fg-desc">{`${prefix}${name}: `}</span>
      <span className={valueClass}>{value}</span>
      <span className="text-vscode-fg-desc">{suffix}</span>
    </span>
  );
}

export function StocksSheetPanel({
  filename,
  onSelectStock,
  selectedCode,
}: StocksSheetPanelProps) {
  const [sortKey, setSortKey] = useState<SortKey>(() => lastSortKey);

  useEffect(() => {
    lastSortKey = sortKey;
  }, [sortKey]);

  const [activeMarket, setActiveMarket] = useState<MarketKey>(() =>
    getMarketFromFilename(filename),
  );
  const [allRows, setAllRows] = useState<StockRow[]>(() => cachedRows);
  const [loading, setLoading] = useState(() => cachedRows.length === 0);
  const [error, setError] = useState(false);
  const [isGuest] = useState(() => getStoredSession() == null);
  const prevPricesRef = useRef<Map<string, number | null>>(new Map());
  const [flashCodes, setFlashCodes] = useState<Set<string>>(new Set());
  const watchlist = useWatchlistStore((s) => s.items);

  const secondsLeft = useRefreshCountdown(
    (isActive) => {
      const symbols = watchlist.map((s) => toYahooSymbol(s.code, s.market));

      getMarketQuotes(symbols)
        .then((quotes) =>
          watchlist.map((s, i) =>
            toYahooRow(
              s,
              quotes.find((q) => q.symbol === symbols[i]),
            ),
          ),
        )
        .then((rows) => {
          if (!isActive()) return;

          const prev = prevPricesRef.current;
          const changed = new Set<string>();
          const next = new Map<string, number | null>();

          for (const row of rows) {
            const before = prev.get(row.code);
            if (before !== undefined && before !== row.priceRaw) {
              changed.add(row.code);
            }
            next.set(row.code, row.priceRaw);
          }

          prevPricesRef.current = next;
          cachedRows = rows;
          setAllRows(rows);
          setError(false);

          if (changed.size) {
            setFlashCodes((previous) => new Set([...previous, ...changed]));
          }
        })
        .catch(() => {
          if (isActive()) setError(true);
        })
        .finally(() => {
          if (isActive()) setLoading(false);
        });
    },
    `stocks:${watchlist.map((s) => s.code).join(",")}`,
    REFRESH_SEC,
  );

  const favoriteItems = useFavoritesStore((s) => s.items);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const currency = useCurrencyStore((s) => s.currency);
  const usdKrw = useFxStore((s) => s.usdKrw);
  const timeframe = useTimeframeStore((s) => s.timeframe);
  const positions = usePositionsStore((state) => state.positions);
  const addPosition = usePositionsStore((state) => state.addPosition);
  const removePosition = usePositionsStore((state) => state.removePosition);

  const isFavorite = (code: string) =>
    favoriteItems.some((favorite) => favorite.code === code);

  const isHeld = (code: string) =>
    positions.some((position) => position.id === code);

  const toggleHeld = (stock: StockRow) => {
    if (isHeld(stock.code)) {
      removePosition(stock.code);
      return;
    }

    addPosition(
      createPosition({
        code: stock.code,
        name: stock.name,
        market: stock.market,
        price: stock.priceRaw,
      }),
    );
  };

  const filteredStocks =
    activeMarket === "ALL"
      ? allRows
      : allRows.filter((stock) => stock.market === activeMarket);

  const stocks =
    sortKey === "default"
      ? filteredStocks
      : [...filteredStocks].sort(
          (a, b) =>
            getSortValue(b, sortKey, currency, usdKrw, timeframe) -
            getSortValue(a, sortKey, currency, usdKrw, timeframe),
        );

  const title = activeMarket === "ALL" ? "전체" : activeMarket;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-vscode-editor font-sans text-vscode-fg">
      <div className="flex shrink-0 flex-col gap-2 border-b border-vscode-border-panel px-[14px] py-2">
        <div className="flex flex-wrap items-center gap-x-[14px] gap-y-2">
          <SegmentFilter
            options={MARKET_OPTIONS}
            value={activeMarket}
            onValueChange={setActiveMarket}
          />

          <Select
            options={SORT_OPTIONS}
            value={sortKey}
            onChange={setSortKey}
            label="정렬"
          />

          <div className="ml-auto flex items-center gap-2.5">
            <RefreshCountdown seconds={secondsLeft} />
            <TimeframeToggle />
            <CurrencyToggle />
          </div>
        </div>

        {isGuest && (
          <span className="text-[11px] text-vscode-fg-desc">
            로그인하면 ★ 즐겨찾기를 쓸 수 있어요.
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto py-2 font-mono text-[13px]">
        <CodeLine line={1}>
          <span className="text-vscode-fg-desc">{`// secret stocks — ${title}`}</span>
        </CodeLine>
        <CodeLine line={2}>
          <span className="text-vscode-fg-desc">
            {`// 시세는 지연 데이터이며 ${REFRESH_SEC}초마다 자동 갱신됩니다.`}
          </span>
        </CodeLine>
        <CodeLine line={3}>
          <span className="text-[#c586c0]">export</span>
          <span> </span>
          <span className="text-[#569cd6]">const</span>
          <span> </span>
          <span className="text-[#4fc1ff]">stocks</span>
          <span> = [</span>
        </CodeLine>

        {loading ? (
          <CodeLine line={4}>
            <span className="text-vscode-fg-desc">{"  // 불러오는 중…"}</span>
          </CodeLine>
        ) : error && stocks.length === 0 ? (
          <CodeLine line={4}>
            <span className="text-vscode-fg-desc">
              {"  // 종목을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."}
            </span>
          </CodeLine>
        ) : null}

        {stocks.map((stock, index) => (
          <CodeLine
            key={stock.code}
            line={index + 4}
            selected={selectedCode === stock.code}
            flash={flashCodes.has(stock.code)}
            onFlashEnd={() =>
              setFlashCodes((previous) => {
                const next = new Set(previous);
                next.delete(stock.code);
                return next;
              })
            }
            onClick={
              onSelectStock
                ? () =>
                    onSelectStock({
                      ...stock,
                      price: String(stock.priceRaw ?? 0),
                      change: formatPct(stock.pctDay),
                    })
                : undefined
            }
          >
            <div className="flex items-center">
              <div
                className="grid gap-x-2"
                style={{ gridTemplateColumns: CODE_COLS }}
              >
                <Field
                  prefix="  { "
                  name="name"
                  value={`'${stock.name}'`}
                  valueClass="text-[#ce9178]"
                />
                <Field
                  name="price"
                  value={formatPrice(
                    stock.priceRaw,
                    stock.market,
                    currency,
                    usdKrw,
                  )}
                  valueClass="text-[#b5cea8]"
                />
                <Field
                  name="change"
                  value={formatPct(pctForTimeframe(stock, timeframe))}
                  valueClass={changeColorClass(
                    formatPct(pctForTimeframe(stock, timeframe)),
                  )}
                />
                <Field
                  name="volume"
                  value={`'${stock.volume}'`}
                  valueClass="text-[#ce9178]"
                  suffix=" },"
                />
              </div>

              <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-3 pr-1">
                <IconButton
                  variant="search"
                  label={
                    isHeld(stock.code) ? "관심종목 추가됨" : "관심종목 추가"
                  }
                  pressed={isHeld(stock.code)}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleHeld(stock);
                  }}
                  icon={isHeld(stock.code) ? "codicon-check" : "codicon-add"}
                  iconSize={12}
                  iconClassName={
                    isHeld(stock.code)
                      ? "text-[var(--vscode-editorGutter-addedBackground)]"
                      : "text-vscode-fg-desc opacity-40"
                  }
                  className="h-4 w-4"
                />

                {!isGuest && (
                  <IconButton
                    variant="search"
                    label={
                      isFavorite(stock.code)
                        ? "즐겨찾기 해제"
                        : stock.stockId == null
                          ? "종목 정보 준비 중 (잠시 후 가능)"
                          : "즐겨찾기"
                    }
                    pressed={isFavorite(stock.code)}
                    disabled={!isFavorite(stock.code) && stock.stockId == null}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite({
                        stockId: stock.stockId,
                        code: stock.code,
                        name: stock.name,
                        market: stock.market,
                      });
                    }}
                    icon="codicon-star-empty"
                    iconSize={13}
                    iconClassName={
                      isFavorite(stock.code)
                        ? "text-yellow-400"
                        : "text-vscode-fg-desc opacity-40"
                    }
                    className="h-4 w-4"
                  />
                )}
              </span>
            </div>
          </CodeLine>
        ))}

        <CodeLine
          line={
            (loading || (error && stocks.length === 0) ? 1 : stocks.length) + 4
          }
        >
          <span>];</span>
        </CodeLine>
      </div>
    </div>
  );
}
