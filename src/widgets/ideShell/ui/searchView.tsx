"use client";

import { useState } from "react";
import { Codicon, IconButton } from "@/shared/ui";

interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
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
      className="search-toggle flex h-[22px] min-w-[22px] shrink-0 cursor-default items-center justify-center border-0 px-0.5 font-semibold"
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
    <div className="flex h-[36px] items-center gap-1">
      <button
        type="button"
        title="Toggle Replace"
        aria-label="Toggle Replace"
        onClick={onToggle}
        className="flex h-[32px] w-[28px] shrink-0 cursor-default items-center justify-center border-0 bg-transparent p-0 text-vscode-fg-icon"
      >
        <Codicon
          icon={expanded ? "codicon-chevron-down" : "codicon-chevron-right"}
          size={18}
        />
      </button>
      {children}
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

  const toggle = (key: keyof SearchOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-[30px] shrink-0 select-none items-center pl-5 pr-1">
        <span className="flex-1 overflow-hidden truncate uppercase font-bold tracking-[0.04em] text-vscode-fg-sidebar text-[length:var(--font-size-sm)]">
          SEARCH
        </span>
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
      <div className="flex shrink-0 flex-col gap-1 pb-1 pl-2 pr-3">
        <SearchInputRow
          expanded={replaceOpen}
          onToggle={() => setReplaceOpen((prev) => !prev)}
        >
          <div className="vs-input-box flex h-[32px] min-w-0 flex-1 items-center gap-0.5 ps-2 pe-[6px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 outline-none text-vscode-fg-input font-sans text-[13px] leading-6"
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
          <div className="flex h-[36px] items-center gap-1">
            <span className="w-[28px] shrink-0" />
            <div className="vs-input-box flex h-[32px] min-w-0 flex-1 items-center gap-0.5 ps-2 pe-[6px]">
              <input
                value={replace}
                onChange={(event) => setReplace(event.target.value)}
                placeholder="Replace"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 outline-none text-vscode-fg-input font-sans text-[13px] leading-6"
              />
              <IconButton
                variant="panel"
                iconSize={14}
                icon="codicon-replace"
                label="Replace (Enter)"
              />
              <IconButton
                variant="panel"
                iconSize={14}
                icon="codicon-preserve-case"
                label="Preserve Case"
              />
            </div>
          </div>
        )}

        <div className="flex h-[18px] justify-end pr-1">
          <IconButton
            variant="search"
            iconSize={14}
            icon="codicon-ellipsis"
            label="Toggle Search Details"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto text-vscode-fg-desc text-[length:var(--font-size-lg)] px-2 py-1">
        {!query ? (
          <div className="select-none py-8 text-center text-[13px]">
            Search for text in the workspace
          </div>
        ) : (
          <div>No results for &quot;{query}&quot;</div>
        )}
      </div>
    </div>
  );
}
