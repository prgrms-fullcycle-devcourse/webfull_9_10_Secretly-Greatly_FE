"use client";

import { useState } from "react";
import { Codicon, FileIcon, IconButton } from "@/shared/ui";

interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

interface StockResult {
  id: string;
  name: string;
  code: string;
  market: "KOSPI" | "NASDAQ" | "CRYPTO";
}

const STOCKS: StockResult[] = [
  { id: "1", name: "삼성전자", code: "005930.KS", market: "KOSPI" },
  { id: "2", name: "SK하이닉스", code: "000660.KS", market: "KOSPI" },
  { id: "3", name: "카카오", code: "035720.KS", market: "KOSPI" },
  { id: "4", name: "LG에너지솔루션", code: "373220.KS", market: "KOSPI" },
  { id: "5", name: "Apple Inc.", code: "AAPL.US", market: "NASDAQ" },
  { id: "6", name: "NVIDIA Corp.", code: "NVDA.US", market: "NASDAQ" },
  { id: "7", name: "Tesla, Inc.", code: "TSLA.US", market: "NASDAQ" },
  { id: "8", name: "비트코인", code: "BTC.KRW", market: "CRYPTO" },
];

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
  onToggleAdded,
  onToggleBookmark,
  onToggleStar,
}: {
  stock: StockResult;
  query: string;
  added: boolean;
  bookmarked: boolean;
  starred: boolean;
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
          <button
            type="button"
            title={added ? "관심종목 추가됨" : "관심종목 추가"}
            aria-pressed={added}
            onClick={onToggleAdded}
            className="flex h-5.5 w-5.5 items-center justify-center rounded hover:bg-vscode-list-active"
          >
            <Codicon
              icon={added ? "codicon-check" : "codicon-add"}
              size={12}
              className={
                added
                  ? "text-[var(--vscode-editorGutter-addedBackground)]"
                  : "text-vscode-fg-icon"
              }
            />
          </button>
          <button
            type="button"
            title={starred ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            aria-pressed={starred}
            onClick={onToggleStar}
            className="flex h-5.5 w-5.5 items-center justify-center rounded hover:bg-vscode-list-active"
          >
            <Codicon
              icon="codicon-star-empty"
              size={13}
              className={starred ? "text-yellow-400" : "text-vscode-fg-icon"}
            />
          </button>
          <button
            type="button"
            title={bookmarked ? "북마크 해제" : "북마크 추가"}
            aria-pressed={bookmarked}
            onClick={onToggleBookmark}
            className="flex h-5.5 w-5.5 items-center justify-center rounded hover:bg-vscode-list-active"
          >
            <Codicon
              icon="codicon-bookmark"
              size={14}
              className={
                bookmarked ? "text-vscode-focus" : "text-vscode-fg-icon"
              }
            />
          </button>
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
  const [starred, setStarred] = useState<Set<string>>(new Set(["1"]));
  const [addedStocks, setAddedStocks] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const toggle = (key: keyof SearchOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAdded = (id: string) => {
    setAddedStocks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const results = query
    ? STOCKS.filter(
        (s) =>
          s.name.toLowerCase().startsWith(query.toLowerCase()) ||
          s.code.toLowerCase().startsWith(query.toLowerCase()),
      )
    : [];

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
                  added={addedStocks.has(stock.id)}
                  bookmarked={bookmarked.has(stock.id)}
                  starred={starred.has(stock.id)}
                  onToggleAdded={() => toggleAdded(stock.id)}
                  onToggleBookmark={() => toggleBookmark(stock.id)}
                  onToggleStar={() => toggleStar(stock.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
