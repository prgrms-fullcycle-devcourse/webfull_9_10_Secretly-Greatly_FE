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
          padding: "0 8px 4px 4px",
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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 outline-none text-vscode-fg-input font-sans text-[13px] leading-5"
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
                onChange={(event) => setReplace(event.target.value)}
                placeholder="Replace"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 outline-none text-vscode-fg-input font-sans text-[13px] leading-5"
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
      <div className="search-results">
        {!query ? (
          <div className="select-none text-[13px]">
            Search for text in the workspace
          </div>
        ) : (
          <div>No results for &quot;{query}&quot;</div>
        )}
      </div>
    </div>
  );
}
