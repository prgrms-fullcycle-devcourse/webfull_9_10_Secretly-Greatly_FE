/** BE 5대 뉴스 주제 분류 태그. */
export type NewsTag =
  | "MACRO"
  | "EARNINGS"
  | "INDUSTRY"
  | "REGULATION"
  | "ISSUE";

/** GET /api/news 타임라인의 개별 뉴스 항목. */
export interface NewsItem {
  newsId: number;
  tag: NewsTag;
  /** 출처 언론사 */
  publisher: string;
  /** 연동 종목 티커 (없으면 null) */
  ticker: string | null;
  /** 연동 종목 현재가 (없으면 null) */
  tickerPrice: number | null;
  /** AI 한 줄 요약 */
  aiOneLineSummary: string;
  /** 에디터에 소스 주석처럼 렌더되는 위장 코멘트 */
  formattedComment: string;
  /** [차트 보기] 활성화 가이드 플래그 */
  hasStockChart: boolean;
  createdAt: string;
}

/** GET /api/news 응답 본문. */
export interface NewsTimeline {
  totalCount: number;
  items: NewsItem[];
}

/** GET /api/news/:newsId 상세 응답 본문. */
export interface NewsDetail {
  newsId: number;
  ticker: string | null;
  title: string;
  aiSummaryPoints: string[];
  originalUrl: string;
  createdAt: string;
}

/** 태그별 표시 라벨·색(위장 UI 토큰). */
export const TAG_META: Record<NewsTag, { label: string; color: string }> = {
  MACRO: { label: "거시", color: "text-(--syntax-function)" },
  EARNINGS: { label: "실적", color: "text-terminal-cyan" },
  INDUSTRY: {
    label: "산업",
    color: "text-(--vscode-notificationsInfoIcon-foreground)",
  },
  REGULATION: {
    label: "규제",
    color: "text-(--vscode-notificationsWarningIcon-foreground)",
  },
  ISSUE: { label: "이슈", color: "text-(--vscode-errorForeground)" },
};

/** 태그 표시 순서 (필터 노출 순서). */
export const NEWS_TAGS: NewsTag[] = [
  "MACRO",
  "EARNINGS",
  "INDUSTRY",
  "REGULATION",
  "ISSUE",
];
