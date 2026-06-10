"use client";

import { useState } from "react";
import { SegmentFilter } from "@/shared/ui";

const FILTERS = ["전체", "실적", "공급망", "정책", "시장"] as const;
const FILTER_OPTIONS = FILTERS.map((filter) => ({
  value: filter,
  label: filter,
}));

type NewsFilter = (typeof FILTERS)[number];
type NewsCategory = Exclude<NewsFilter, "전체">;

const CATEGORY_COLOR: Record<NewsCategory, string> = {
  실적: "text-terminal-cyan",
  공급망: "text-(--vscode-notificationsInfoIcon-foreground)",
  시장: "text-(--syntax-function)",
  정책: "text-(--vscode-notificationsWarningIcon-foreground)",
};

const NEWS_ITEMS: Array<{
  category: NewsCategory;
  source: string;
  time: string;
  href: string;
  title: string;
  summary: string;
}> = [
  {
    category: "실적",
    source: "연합인포맥스",
    time: "09:42",
    href: "https://example.com/news/nvidia-data-center-sales-guidance",
    title: "엔비디아, 데이터센터 매출 가이던스 상회 전망 보도",
    summary:
      "AI 반도체 수요 확대가 분기 매출 기대치를 끌어올린 주요 요인으로 언급됨.",
  },
  {
    category: "공급망",
    source: "한국경제",
    time: "09:35",
    href: "https://example.com/news/samsung-hbm3e-production-line",
    title: "삼성전자, HBM3E 12단 양산 라인 가동 보도",
    summary: "외국인 순매수 전환과 함께 메모리 업황 회복 신호가 일부 관측됨.",
  },
  {
    category: "시장",
    source: "Bloomberg",
    time: "09:28",
    href: "https://example.com/news/bitcoin-etf-inflows",
    title: "현물 ETF 순유입 5거래일 연속 지속",
    summary: "기관 자금 유입으로 거래대금이 증가했다는 시장 코멘트.",
  },
  {
    category: "공급망",
    source: "전자신문",
    time: "09:21",
    href: "https://example.com/news/sk-hynix-hbm-supply-expansion",
    title: "SK하이닉스, 데이터센터향 HBM 공급 확대 협의 보도",
    summary: "메모리 가격 반등 기대가 재부각되며 관련주 모멘텀 확인.",
  },
  {
    category: "정책",
    source: "Reuters",
    time: "09:14",
    href: "https://example.com/news/apple-service-policy-review",
    title: "애플, 신규 서비스 구독 정책 변경 검토 보도",
    summary: "서비스 부문 매출 성장 지속 여부가 관전 포인트로 언급됨.",
  },
  {
    category: "시장",
    source: "머니투데이",
    time: "09:06",
    href: "https://example.com/news/kakao-ai-service-launch",
    title: "카카오, 신규 AI 서비스 출시 일정 공개",
    summary:
      "광고 매출 회복 관측이 일부 제기되었으나 영향은 제한적이라는 평가.",
  },
  {
    category: "실적",
    source: "이데일리",
    time: "08:58",
    href: "https://example.com/news/lg-energy-solution-demand-outlook",
    title: "LG에너지솔루션, 수주 잔고 관련 코멘트 발표",
    summary: "전기차 수요 둔화 우려가 보도되었으나 중장기 수주는 유지.",
  },
  {
    category: "시장",
    source: "Yahoo Finance",
    time: "08:49",
    href: "https://example.com/news/tesla-quarterly-delivery-guidance",
    title: "테슬라, 분기 인도량 가이던스 관련 보도",
    summary: "가격 정책 변경 코멘트가 함께 언급됨.",
  },
];

export function NewsFeedPanel() {
  const [selectedFilter, setSelectedFilter] = useState<NewsFilter>("전체");
  const visibleNews =
    selectedFilter === "전체"
      ? NEWS_ITEMS
      : NEWS_ITEMS.filter((item) => item.category === selectedFilter);

  return (
    <div className="flex h-full min-h-0 flex-col bg-vscode-editor font-sans text-vscode-fg">
      <div className="flex h-[40px] shrink-0 items-center border-b border-vscode-border-widget px-3.5">
        <SegmentFilter
          options={FILTER_OPTIONS}
          value={selectedFilter}
          onValueChange={setSelectedFilter}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {visibleNews.map((item) => (
          <article
            key={item.href}
            className="h-[90px] overflow-hidden border-b border-vscode-border-widget bg-vscode-editor px-5 py-3 hover:bg-vscode-list-hover"
          >
            <div className="flex h-[21px] items-start gap-[8px] pb-[5px]">
              <span
                className={`mt-[1.5px] h-[13px] rounded-[3px] bg-[rgba(255,255,255,0.06)] px-[7px] text-[10px] font-semibold leading-3.25 ${CATEGORY_COLOR[item.category]}`}
              >
                {item.category}
              </span>
              <span className="text-[12px] leading-4 text-vscode-fg">
                {item.source}
              </span>
              <span className="text-[12px] leading-4 text-(--vscode-disabledForeground)">
                ·
              </span>
              <span className="font-mono text-[12px] leading-4 text-vscode-fg-desc">
                {item.time}
              </span>
            </div>

            <h2 className="h-[20px] truncate text-[14px] leading-5 text-vscode-fg">
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-inherit [text-decoration:none] hover:text-vscode-focus hover:underline hover:underline-offset-2 focus-visible:text-vscode-focus focus-visible:underline focus-visible:underline-offset-2"
              >
                {item.title}
              </a>
            </h2>

            <div className="flex h-[24px] items-start gap-[8px] pt-[5px]">
              <span className="flex h-[16px] shrink-0 items-center justify-center rounded-[2px] bg-[color-mix(in_srgb,var(--syntax-type)_12%,transparent)] px-1.25 font-mono text-[10px] leading-3.25 text-(--syntax-type)">
                SUMMARY
              </span>
              <p className="min-w-0 flex-1 truncate text-[12.5px] leading-4.75 text-vscode-fg-desc">
                {item.summary}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="shrink-0 border-t border-vscode-border-widget bg-vscode-panel px-4 py-2.5">
        <p className="text-[11px] leading-[14px] text-(--vscode-disabledForeground)">
          뉴스 요약은 정보 제공 목적이며 투자 조언이 아닙니다. 매수/매도 추천을
          포함하지 않습니다.
        </p>
      </div>
    </div>
  );
}
