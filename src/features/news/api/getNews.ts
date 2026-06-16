import { customInstance, type APIResponse } from "@/shared/api";
import type { NewsDetail, NewsTimeline } from "../model/types";

/**
 * GET /api/news — 당일 AI 분석 뉴스 타임라인.
 * JWT 필요(apiClient 인터셉터가 토큰 자동 첨부).
 */
export async function getNewsTimeline(): Promise<NewsTimeline> {
  const res = await customInstance<APIResponse<NewsTimeline>>({
    url: "/news",
    method: "GET",
  });
  return res.data;
}

/** GET /api/news/:id — 뉴스 상세(3줄 요약 + 원문 링크). */
export async function getNewsDetail(id: number): Promise<NewsDetail> {
  const res = await customInstance<APIResponse<NewsDetail>>({
    url: `/news/${id}`,
    method: "GET",
  });
  return res.data;
}
