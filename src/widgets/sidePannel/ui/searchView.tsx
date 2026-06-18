"use client";

import { useEffect, useState } from "react";
import { Codicon, FileIcon, IconButton } from "@/shared/ui";
import { createPosition, usePositionsStore } from "@/entities/position";
import { useFavoritesStore } from "@/features/favorites";
import { useWatchlistStore } from "@/features/watchlist";
import { getStocks } from "@/features/stocks";
import { getStoredSession } from "@/shared/api";

interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

interface StockResult {
  id: string;
  name: string;
  code: string;
  market: "DOMESTIC" | "OVERSEAS";
  /** 현재가 (미적재 시 null) — 보유 목록 추가 시 currentPrice 로 사용 (화면 표시 X). */
  price: number | null;
}

function SearchToggle({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className="search-toggle flex h-5 min-w-5 shrink-0 cursor-default items-center justify-center border-0 px-0.5 font-semibold"
    >
      {children}
    </button>
  );
}

function SearchInputRow({
  children,
  expanded,
  onToggle,
}: {
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="search-input-row"
      style={{ display: "flex", alignItems: "center", height: 28, gap: 0 }}
    >
      <button
        type="button"
        title="Toggle Replace"
        aria-label="Toggle Replace"
        onClick={onToggle}
        className="search-replace-toggle"
      >
        <Codicon
          icon={expanded ? "codicon-chevron-down" : "codicon-chevron-right"}
          size={16}
        />
      </button>
      {children}
    </div>
  );
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return <>{text}</>;
  const prefix = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const suffix = text.slice(idx + query.length);

  return (
    <span className="relative inline-block whitespace-pre">
      <span className="invisible">{text}</span>
      <span className="absolute inset-0">
        {prefix}
        <span className="rounded-sm bg-[var(--vscode-editor-selectionBackground)]">
          {match}
        </span>
        {suffix}
      </span>
    </span>
  );
}

function ResultItem({
  stock,
  query,
  added,
  bookmarked,
  starred,
  canFavorite,
  onToggleAdded,
  onToggleBookmark,
  onToggleStar,
}: {
  stock: StockResult;
  query: string;
  added: boolean;
  bookmarked: boolean;
  starred: boolean;
  /** 즐겨찾기(★) 쓰기 가능 여부 (비로그인은 false). 보유추가(+)는 로그인 무관. */
  canFavorite: boolean;
  onToggleAdded: () => void;
  onToggleBookmark: () => void;
  onToggleStar: () => void;
}) {
  return (
    <div>
      <div className="group flex h-5.5 cursor-pointer select-none items-center gap-[5px] py-0 pr-2 pl-1.5 hover:bg-vscode-list-hover">
        <Codicon
          icon="codicon-chevron-down"
          size={16}
          className="shrink-0 text-vscode-fg-icon"
        />
        <FileIcon filename={stock.name} size={14} />
        <span className="flex min-w-0 flex-1 items-center gap-1 truncate text-[13px] text-vscode-search-name">
          <HighlightMatch text={stock.name} query={query} />
        </span>
        <div
          className="flex shrink-0 items-start"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 보유추가(+)는 로그인 무관(물타기 계산기), 즐겨찾기(★)는 로그인 사용자만. */}
          <IconButton
            variant="search"
            label={added ? "관심종목 추가됨" : "관심종목 추가"}
            pressed={added}
            onClick={onToggleAdded}
            icon={added ? "codicon-check" : "codicon-add"}
            iconSize={12}
            iconClassName={
              added
                ? "text-[var(--vscode-editorGutter-addedBackground)]"
                : undefined
            }
          />
          {canFavorite && (
            <IconButton
              variant="search"
              label={starred ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              pressed={starred}
              onClick={onToggleStar}
              icon="codicon-star-empty"
              iconSize={13}
              iconClassName={starred ? "text-yellow-400" : undefined}
            />
          )}
          <IconButton
            variant="search"
            label={bookmarked ? "북마크 해제" : "북마크 추가"}
            pressed={bookmarked}
            onClick={onToggleBookmark}
            icon="codicon-bookmark"
            iconSize={14}
            iconClassName={bookmarked ? "text-vscode-focus" : undefined}
          />
        </div>
      </div>

      <div className="flex h-5.5 cursor-pointer select-none items-center pl-7 pr-2 hover:bg-vscode-list-hover">
        <span className="flex-1 truncate text-[13px] text-vscode-fg-desc">
          {stock.code}
        </span>
      </div>
    </div>
  );
}

export function SearchView() {
  const [query, setQuery] = useState("");
  const [replace, setReplace] = useState("");
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [options, setOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
  });
  const [results, setResults] = useState<StockResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(false);
  // 보유추가·즐겨찾기 쓰기는 로그인 사용자만 (검색 자체는 비로그인도 가능).
  const [isGuest] = useState(() => getStoredSession() == null);

  // 즐겨찾기 공유 스토어 — ★ 버튼이 즐겨찾기 트리·시트와 동기화.
  const favoriteItems = useFavoritesStore((s) => s.items);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const isFavorite = (code: string) =>
    favoriteItems.some((f) => f.code === code);

  // 관심목록(시세 리스트) 스토어 — 🔖 북마크가 시세 리스트에 종목을 가감한다.
  const watchlist = useWatchlistStore((s) => s.items);
  const toggleWatchlist = useWatchlistStore((s) => s.toggle);
  const isWatched = (code: string) => watchlist.some((w) => w.code === code);

  // 보유 종목 공유 스토어 — + 버튼이 물타기 패널 목록에 추가/제거.
  const positions = usePositionsStore((state) => state.positions);
  const addPosition = usePositionsStore((state) => state.addPosition);
  const removePosition = usePositionsStore((state) => state.removePosition);

  // 검색어 변경 시 BE 종목 검색 (GET /api/stocks?keyword=). 300ms 디바운스 + stale 응답 무시.
  useEffect(() => {
    const keyword = query.trim();
    let ignore = false;
    const handle = setTimeout(
      () => {
        if (!keyword) {
          if (!ignore) {
            setResults([]);
            setError(false);
            setSearching(false);
          }
          return;
        }
        setSearching(true);
        getStocks({ keyword })
          .then((items) => {
            if (ignore) return;
            setError(false);
            // 시작일치(prefix)만 — "A" 검색 시 A로 시작하는 것만. BE 는 부분일치라 FE 에서 좁힌다.
            const kw = keyword.toLowerCase();
            setResults(
              items
                .filter(
                  (s) =>
                    s.name.toLowerCase().startsWith(kw) ||
                    s.code.toLowerCase().startsWith(kw),
                )
                .map((s) => ({
                  id: s.code,
                  name: s.name,
                  code: s.code,
                  market: s.market,
                  price: s.price,
                })),
            );
          })
          .catch(() => {
            if (ignore) return;
            setError(true);
            setResults([]);
          })
          .finally(() => {
            if (!ignore) setSearching(false);
          });
      },
      keyword ? 300 : 0,
    );
    return () => {
      ignore = true;
      clearTimeout(handle);
    };
  }, [query]);

  const toggle = (key: keyof SearchOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAdded = (stock: StockResult) => {
    if (positions.some((p) => p.id === stock.code)) {
      removePosition(stock.code);
    } else {
      addPosition(createPosition(stock));
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sidebar-view-title">
        <span className="sidebar-view-title-label">SEARCH</span>
        <div className="flex items-center gap-0.5">
          <IconButton
            variant="search"
            iconSize={14}
            icon="codicon-refresh"
            label="Refresh"
          />
          <IconButton
            variant="search"
            iconSize={14}
            icon="codicon-close"
            label="Clear Search Results"
          />
          <IconButton
            variant="search"
            iconSize={14}
            icon="codicon-new-file"
            label="Open New Search Editor"
          />
          <IconButton
            variant="search"
            iconSize={14}
            icon="codicon-list-filter"
            label="Toggle Search Details"
          />
          <IconButton
            variant="search"
            iconSize={14}
            icon="codicon-collapse-all"
            label="Collapse All"
          />
        </div>
      </div>

      {/* Inputs */}
      <div
        className="search-controls"
        style={{
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          gap: 2,
          padding: "0 14px 4px 4px",
        }}
      >
        <SearchInputRow
          expanded={replaceOpen}
          onToggle={() => setReplaceOpen((prev) => !prev)}
        >
          <div
            className="vs-input-box search-field"
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              minWidth: 0,
              height: 26,
              gap: 2,
              paddingLeft: 8,
              paddingRight: 4,
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-[13px] leading-5 text-vscode-fg-input outline-none"
            />
            <SearchToggle
              active={options.caseSensitive}
              label="Match Case"
              onClick={() => toggle("caseSensitive")}
            >
              Aa
            </SearchToggle>
            <SearchToggle
              active={options.wholeWord}
              label="Match Whole Word"
              onClick={() => toggle("wholeWord")}
            >
              ab
            </SearchToggle>
            <SearchToggle
              active={options.useRegex}
              label="Use Regular Expression"
              onClick={() => toggle("useRegex")}
            >
              .*
            </SearchToggle>
          </div>
        </SearchInputRow>

        {replaceOpen && (
          <div
            className="search-input-row"
            style={{
              display: "flex",
              alignItems: "center",
              height: 28,
              gap: 0,
            }}
          >
            <span className="search-replace-spacer" />
            <div
              className="vs-input-box search-field"
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                minWidth: 0,
                height: 26,
                gap: 2,
                paddingLeft: 8,
                paddingRight: 4,
              }}
            >
              <input
                value={replace}
                onChange={(e) => setReplace(e.target.value)}
                placeholder="Replace"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-[13px] leading-5 text-vscode-fg-input outline-none"
              />
            </div>
            <IconButton
              variant="search"
              iconSize={16}
              icon="codicon-preserve-case"
              label="Preserve Case"
              className="search-preserve-action"
            />
          </div>
        )}

        <div className="search-more-row">
          <IconButton
            variant="search"
            iconSize={14}
            icon="codicon-ellipsis"
            label="Toggle Search Details"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-1 flex-col overflow-auto">
        {!query ? (
          <div className="search-results select-none">
            Search for text in the workspace
          </div>
        ) : searching ? (
          <div className="search-results select-none">검색 중…</div>
        ) : error ? (
          <div className="search-results select-none">
            서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.
          </div>
        ) : results.length === 0 ? (
          <div className="search-results select-none">
            No results for &quot;{query}&quot;
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1 pt-0.5 pb-1 pl-6 pr-3.5 text-[12px] text-vscode-fg-desc select-none">
              <span>
                {results.length} {results.length === 1 ? "result" : "results"}{" "}
                in {results.length} {results.length === 1 ? "file" : "files"}
              </span>
              <span>-</span>
              <button
                type="button"
                className="border-0 bg-transparent p-0 text-vscode-focus"
              >
                Open in editor
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {results.map((stock) => (
                <ResultItem
                  key={stock.id}
                  stock={stock}
                  query={query}
                  added={positions.some((p) => p.id === stock.code)}
                  bookmarked={isWatched(stock.code)}
                  starred={isFavorite(stock.code)}
                  canFavorite={!isGuest}
                  onToggleAdded={() => toggleAdded(stock)}
                  onToggleBookmark={() =>
                    toggleWatchlist({
                      code: stock.code,
                      name: stock.name,
                      market: stock.market,
                    })
                  }
                  onToggleStar={() =>
                    toggleFavorite({
                      code: stock.code,
                      name: stock.name,
                      market: stock.market,
                    })
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
