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
// "default" = 등록순(원본 순서 유지, 정렬 안 함).
type SortKey = "default" | "price" | "volume" | "change";

interface StockRow {
  code: string;
  name: string;
  /** native 통화 기준 현재가 (표시 통화 변환은 렌더에서). 미적재 시 null. */
  priceRaw: number | null;
  /** 기간별 등락률(%) — 분봉 토글로 골라 표시. 미적재/장마감이면 null → "—". */
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

/** 정렬 선택을 새 탭(패널 remount) 사이에 유지 — 모듈 변수(브라우저 재시작엔 초기화, localStorage 불필요). */
let lastSortKey: SortKey = "default";

/** 미적재 시세 표시값 — 정렬에서는 항상 맨 아래로 보낸다. */
const NO_VALUE = "—";

/** 시세 자동 갱신 주기 (초). 로그인 무관하게 이 간격으로 재조회 + 카운트다운. */
const REFRESH_SEC = 5;

/** 직전 시세 모듈 캐시 — 탭 전환으로 패널이 remount 돼도 즉시 보여줘 "불러오는 중" 깜빡임 방지. */
let cachedRows: StockRow[] = [];

/** Yahoo 시세(숫자) → 시트 표시용 StockRow. 기간별 등락률은 렌더에서 분봉 토글로 고른다. */
function toYahooRow(
  stock: WatchlistItem,
  quote: MarketQuote | undefined,
): StockRow {
  return {
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

/** 분봉 토글 → 그 기간의 등락률(%). 기본 "일간"=전일 종가 대비(표준). 데이터 없으면 null. */
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

/** 등락률(%) → 표시 문자열 (+부호·소수 2자리). null 이면 "—". */
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
  // 미적재는 정렬에서 항상 맨 아래 (등락률 음수보다도 아래로).
  // price 는 표시 통화로 변환해 비교 → 시장 섞여도(원/달러) 정렬이 일관됨.
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
  // 등락률은 현재 선택된 분봉 기준으로 정렬 (표시값과 일치).
  return pctForTimeframe(stock, timeframe) ?? Number.NEGATIVE_INFINITY;
}

/** 코드처럼 보이되 필드가 세로로 정렬되도록 한 줄 = 4컬럼 그리드 (name·price·change·volume). */
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
  /** 값이 바뀐 행 — 배경 플래시 1회. */
  flash?: boolean;
  /** 플래시 애니메이션 종료 시 (다음 플래시 재발동 위해 상태에서 제거). */
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

/** 한 필드: `key: value,` — key/구두점은 기본색, 값만 강조. 셀은 truncate로 정렬 유지. */
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
  // 정렬은 모듈 변수에서 복원 → 새 탭으로 remount 돼도 직전 선택 유지. 기본은 등록순.
  const [sortKey, setSortKey] = useState<SortKey>(() => lastSortKey);
  // 선택이 바뀌면 모듈 변수에 보관(렌더 중이 아니라 effect 에서). 다음 remount 때 복원된다.
  useEffect(() => {
    lastSortKey = sortKey;
  }, [sortKey]);
  // activeMarket 초기값은 파일명 기준. 탭 전환 시 갱신은 ideShell 의 key={tab.id}
  // (패널 remount)로 처리한다 — effect 내 setState 는 프로젝트 lint 금지(set-state-in-effect).
  const [activeMarket, setActiveMarket] = useState<MarketKey>(() =>
    getMarketFromFilename(filename),
  );
  // 캐시가 있으면 remount 시 즉시 표시 (깜빡임 방지), 백그라운드로 조용히 재조회.
  const [allRows, setAllRows] = useState<StockRow[]>(() => cachedRows);
  const [loading, setLoading] = useState(() => cachedRows.length === 0);
  const [error, setError] = useState(false);
  // 로그인 여부는 마운트 시 1회만 확인 (세션 없으면 비로그인 = Yahoo 시세 + 읽기전용).
  const [isGuest] = useState(() => getStoredSession() == null);
  // 직전 가격(코드별) — 갱신 때 비교해 바뀐 행만 플래시.
  const prevPricesRef = useRef<Map<string, number | null>>(new Map());
  // 이번 갱신에서 값이 바뀌어 배경 플래시 중인 코드들.
  const [flashCodes, setFlashCodes] = useState<Set<string>>(new Set());
  // 시세 리스트 종목 = 사용자 관심목록(검색 북마크로 가감). 초기값은 기본 15종목.
  const watchlist = useWatchlistStore((s) => s.items);

  // 자동 갱신 카운트다운 + 폴링 (공통 훅). 0이 되면 Yahoo 시세 재조회 → 바뀐 행만 플래시.
  // 시세는 로그인 무관 Yahoo(실데이터). 관심목록이 바뀌면 restartKey 가 바뀌어 즉시 재조회.
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
          // 직전 가격과 비교 → 바뀐 코드만 플래시 (첫 로드는 비교 대상 없어 플래시 X).
          const prev = prevPricesRef.current;
          const changed = new Set<string>();
          const next = new Map<string, number | null>();
          for (const r of rows) {
            const before = prev.get(r.code);
            if (before !== undefined && before !== r.priceRaw)
              changed.add(r.code);
            next.set(r.code, r.priceRaw);
          }
          prevPricesRef.current = next;
          cachedRows = rows;
          setAllRows(rows);
          setError(false);
          if (changed.size) setFlashCodes((p) => new Set([...p, ...changed]));
        })
        .catch(() => {
          // 폴링 중 일시 오류는 직전 데이터 유지 (빈 화면 깜빡임 방지).
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
  const isFavorite = (code: string) =>
    favoriteItems.some((f) => f.code === code);
  const positions = usePositionsStore((state) => state.positions);
  const addPosition = usePositionsStore((state) => state.addPosition);
  const removePosition = usePositionsStore((state) => state.removePosition);
  const isHeld = (code: string) => positions.some((p) => p.id === code);
  const toggleHeld = (stock: StockRow) => {
    if (isHeld(stock.code)) {
      removePosition(stock.code);
    } else {
      addPosition(
        createPosition({
          code: stock.code,
          name: stock.name,
          market: stock.market,
          price: stock.priceRaw,
        }),
      );
    }
  };
  const filteredStocks =
    activeMarket === "ALL"
      ? allRows
      : allRows.filter((stock) => stock.market === activeMarket);
  // 등록순(default)은 원본 순서 유지, 그 외는 선택 기준으로 정렬.
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
        {/* 툴바 행 — 화면 좁으면 wrap (flex 한 줄 강제 X). */}
        <div className="flex flex-wrap items-center gap-x-[14px] gap-y-2">
          <SegmentFilter
            options={MARKET_OPTIONS}
            value={activeMarket}
            onValueChange={setActiveMarket}
          />

          {/* 정렬 — 차트 봉 단위와 동일한 셀렉트 디자인. */}
          <Select
            options={SORT_OPTIONS}
            value={sortKey}
            onChange={setSortKey}
            label="정렬"
          />

          <div className="ml-auto flex items-center gap-2.5">
            <RefreshCountdown seconds={secondsLeft} />

            {/* 분봉 — 등락률을 어느 기간으로 볼지 (일간 기본=표준). 공유 store, 상세도 같이 반영. */}
            <TimeframeToggle />
            <CurrencyToggle />
          </div>
        </div>

        {/* 비로그인 안내 — 좁은 화면에서 깨지지 않도록 툴바 아래 줄로 분리. */}
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
              setFlashCodes((p) => {
                const next = new Set(p);
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

              {/* +보유추가(물타기)는 로그인 무관, ★즐겨찾기는 로그인 사용자만. */}
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
                      isFavorite(stock.code) ? "즐겨찾기 해제" : "즐겨찾기"
                    }
                    pressed={isFavorite(stock.code)}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite({
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
