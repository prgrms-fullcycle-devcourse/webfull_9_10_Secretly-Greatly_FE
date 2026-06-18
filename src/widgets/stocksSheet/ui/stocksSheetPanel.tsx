"use client";

import { useState } from "react";
import { Codicon, IconButton, SegmentFilter } from "@/shared/ui";
import { changeColorClass, parseChange, parseVolume } from "@/shared/lib";
import { createPosition, usePositionsStore } from "@/entities/position";
import { useFavoritesStore } from "@/features/favorites";
import type { StockSummary } from "@/widgets/stockDetail";

interface StocksSheetPanelProps {
  filename: string;
  /** 종목 행 클릭 시 상세 패널을 여는 콜백. */
  onSelectStock?: (stock: StockSummary) => void;
  /** 현재 상세 패널에 열려 있는 종목 코드 (행 강조용). */
  selectedCode?: string | null;
}

type MarketKey = "ALL" | "DOMESTIC" | "OVERSEAS" | "COIN";
type SortKey = "price" | "volume" | "change";

interface StockRow {
  stockId: number;
  code: string;
  name: string;
  price: string;
  change: string;
  volume: string;
  market: Exclude<MarketKey, "ALL">;
}

const MARKET_OPTIONS: Array<{ value: MarketKey; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "DOMESTIC", label: "국장" },
  { value: "OVERSEAS", label: "미장" },
  { value: "COIN", label: "코인" },
];

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "price", label: "현재가" },
  { key: "volume", label: "거래량" },
  { key: "change", label: "등락률" },
];

const STOCKS: StockRow[] = [
  {
    stockId: 1,
    code: "005930",
    name: "삼성전자",
    price: "74500",
    change: "+1.08%",
    volume: "12.43M",
    market: "DOMESTIC",
  },
];

function getMarketFromFilename(filename: string): MarketKey {
  const prefix = filename.replace(".sheet", "").toUpperCase();
  return prefix === "DOMESTIC" || prefix === "OVERSEAS" || prefix === "COIN"
    ? prefix
    : "ALL";
}

function getSortValue(stock: StockRow, sortKey: SortKey) {
  if (sortKey === "price") return Number.parseFloat(stock.price) || 0;
  if (sortKey === "volume") return parseVolume(stock.volume);
  return parseChange(stock.change);
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
}: {
  line: number;
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
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
      className={`flex min-h-[22px] leading-[22px] ${
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
  const [sortKey, setSortKey] = useState<SortKey>("change");
  // activeMarket 초기값은 파일명 기준. 탭 전환 시 갱신은 ideShell 의 key={tab.id}
  // (패널 remount)로 처리한다 — effect 내 setState 는 프로젝트 lint 금지(set-state-in-effect).
  const [activeMarket, setActiveMarket] = useState<MarketKey>(() =>
    getMarketFromFilename(filename),
  );
  const favoriteItems = useFavoritesStore((s) => s.items);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
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
      addPosition(createPosition(stock));
    }
  };
  const filteredStocks =
    activeMarket === "ALL"
      ? STOCKS
      : STOCKS.filter((stock) => stock.market === activeMarket);
  const stocks = [...filteredStocks].sort(
    (a, b) => getSortValue(b, sortKey) - getSortValue(a, sortKey),
  );
  const title = activeMarket === "ALL" ? "전체" : activeMarket;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-vscode-editor font-sans text-vscode-fg">
      <div className="flex shrink-0 items-center gap-[14px] border-b border-vscode-border-panel px-[14px] py-2">
        <SegmentFilter
          options={MARKET_OPTIONS}
          value={activeMarket}
          onValueChange={setActiveMarket}
        />

        <div className="flex items-center gap-1">
          <span className="text-[11px] text-[var(--vscode-disabledForeground)]">
            정렬:
          </span>
          {SORT_OPTIONS.map((option) => {
            const active = option.key === sortKey;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={active}
                onClick={() => setSortKey(option.key)}
                className={`flex h-[22px] cursor-pointer items-center rounded-[3px] px-1.5 text-[12px] ${
                  active ? "text-vscode-focus" : "text-vscode-fg-desc"
                }`}
              >
                {option.label}
                <Codicon
                  icon="codicon-chevron-down"
                  size={12}
                  className={`ml-0.5 ${active ? "" : "opacity-0"}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto py-2 font-mono text-[13px]">
        <CodeLine line={1}>
          <span className="text-vscode-fg-desc">{`// secret stocks — ${title}`}</span>
        </CodeLine>
        <CodeLine line={2}>
          <span className="text-vscode-fg-desc">
            {"// 시세는 지연 데이터이며 자동 갱신됩니다."}
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

        {stocks.map((stock, index) => (
          <CodeLine
            key={stock.code}
            line={index + 4}
            selected={selectedCode === stock.code}
            onClick={onSelectStock ? () => onSelectStock(stock) : undefined}
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
                  value={stock.price}
                  valueClass="text-[#b5cea8]"
                />
                <Field
                  name="change"
                  value={stock.change}
                  valueClass={changeColorClass(stock.change)}
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
                <IconButton
                  variant="search"
                  label={isFavorite(stock.code) ? "즐겨찾기 해제" : "즐겨찾기"}
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
              </span>
            </div>
          </CodeLine>
        ))}

        <CodeLine line={stocks.length + 4}>
          <span>];</span>
        </CodeLine>
      </div>
    </div>
  );
}
