/** BE 5대 뉴스 주제 분류 태그. */
export type NewsTag =
  | "MACRO"
  | "EARNINGS"
  | "INDUSTRY"
  | "REGULATION"
  | "ISSUE";

/** GET /api/news 타임라인의 개별 뉴스 항목. */
export interface NewsItem {
  id: number;
  /** 기사 제목 */
  title: string;
  /** 뉴스 성격 태그 (분류 실패 시 null) */
  tag: NewsTag | null;
  /** 출처 언론사 */
  source: string;
  /** AI 한 줄 요약 */
  summary: string;
  /** 원문 기사 링크 */
  link: string;
  /** 발행 시각(ISO) */
  pub_date: string;
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
