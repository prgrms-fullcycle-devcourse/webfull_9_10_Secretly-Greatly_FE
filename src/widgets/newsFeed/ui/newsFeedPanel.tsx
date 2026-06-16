"use client";

import { useMemo, useState } from "react";
import { SegmentFilter, Codicon } from "@/shared/ui";
import {
  NEWS_TAGS,
  TAG_META,
  useNewsTimeline,
  type NewsItem,
  type NewsTag,
} from "@/features/news";

type FilterValue = "ALL" | NewsTag;

const FILTER_OPTIONS = [
  { value: "ALL" as const, label: "전체" },
  ...NEWS_TAGS.map((tag) => ({ value: tag, label: TAG_META[tag].label })),
];

/** ISO 시간 → HH:mm (실패 시 빈 문자열). */
function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function NewsRow({ item }: { item: NewsItem }) {
  const meta = TAG_META[item.tag];
  return (
    <article className="overflow-hidden border-b border-vscode-border-widget bg-vscode-editor px-5 py-3 hover:bg-vscode-list-hover">
      <div className="flex h-[21px] items-center gap-[8px] pb-[5px]">
        <span
          className={`h-[14px] rounded-[3px] bg-[rgba(255,255,255,0.06)] px-[7px] text-[10px] font-semibold leading-[14px] ${meta.color}`}
        >
          {meta.label}
        </span>
        <span className="text-[12px] leading-4 text-vscode-fg">
          {item.publisher}
        </span>
        <span className="text-[12px] leading-4 text-(--vscode-disabledForeground)">
          ·
        </span>
        <span className="font-mono text-[12px] leading-4 text-vscode-fg-desc">
          {formatTime(item.createdAt)}
        </span>
        {item.ticker && (
          <span className="ml-auto flex items-center gap-1 font-mono text-[11px] text-(--syntax-type)">
            {item.hasStockChart && (
              <Codicon icon="codicon-graph-line" size={11} />
            )}
            {item.ticker}
            {item.tickerPrice != null && (
              <span className="text-vscode-fg-desc">
                {item.tickerPrice.toLocaleString()}
              </span>
            )}
          </span>
        )}
      </div>

      <h2 className="truncate text-[14px] leading-5 text-vscode-fg">
        {item.aiOneLineSummary}
      </h2>

      <div className="flex h-[24px] items-start gap-[8px] pt-[5px]">
        <span className="flex h-[16px] shrink-0 items-center justify-center rounded-[2px] bg-[color-mix(in_srgb,var(--syntax-type)_12%,transparent)] px-1.25 font-mono text-[10px] leading-3.25 text-(--syntax-type)">
          SUMMARY
        </span>
        <p className="min-w-0 flex-1 truncate font-mono text-[12px] leading-4.75 text-vscode-fg-desc">
          {item.formattedComment}
        </p>
      </div>
    </article>
  );
}

function CenterMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center text-[12.5px] text-vscode-fg-desc">
      {children}
    </div>
  );
}

export function NewsFeedPanel() {
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const { items, status, error, refetch } = useNewsTimeline();

  const visible = useMemo(
    () => (filter === "ALL" ? items : items.filter((it) => it.tag === filter)),
    [items, filter],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-vscode-editor font-sans text-vscode-fg">
      <div className="flex h-[40px] shrink-0 items-center gap-2 border-b border-vscode-border-widget px-3.5">
        <SegmentFilter
          options={FILTER_OPTIONS}
          value={filter}
          onValueChange={(v) => setFilter(v as FilterValue)}
        />
        <button
          type="button"
          onClick={refetch}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-[4px] text-vscode-fg-icon hover:bg-vscode-list-hover"
          aria-label="새로고침"
          title="새로고침"
        >
          <Codicon icon="codicon-refresh" size={14} />
        </button>
      </div>

      {status === "unauthed" ? (
        <CenterMessage>로그인하면 당일 AI 뉴스를 볼 수 있습니다.</CenterMessage>
      ) : status === "loading" || status === "idle" ? (
        <CenterMessage>뉴스를 불러오는 중…</CenterMessage>
      ) : status === "error" ? (
        <CenterMessage>
          <span className="flex flex-col items-center gap-2">
            {error ?? "뉴스를 불러오지 못했습니다."}
            <button
              type="button"
              onClick={refetch}
              className="rounded-[4px] border border-vscode-border-input px-2 py-0.5 text-[12px] hover:bg-vscode-list-hover"
            >
              다시 시도
            </button>
          </span>
        </CenterMessage>
      ) : visible.length === 0 ? (
        <CenterMessage>표시할 뉴스가 없습니다.</CenterMessage>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          {visible.map((item) => (
            <NewsRow key={item.newsId} item={item} />
          ))}
        </div>
      )}

      <div className="shrink-0 border-t border-vscode-border-widget bg-vscode-panel px-4 py-2.5">
        <p className="text-[11px] leading-[14px] text-(--vscode-disabledForeground)">
          뉴스 요약은 정보 제공 목적이며 투자 조언이 아닙니다. 매수/매도 추천을
          포함하지 않습니다.
        </p>
      </div>
    </div>
  );
}
