"use client";

import { useCallback, useEffect, useState } from "react";
import { getStoredToken, onAuthChange } from "@/shared/api";
import { getNewsTimeline } from "../api";
import type { NewsItem } from "./types";

export type NewsStatus = "idle" | "loading" | "success" | "error" | "unauthed";

export interface UseNewsTimelineResult {
  items: NewsItem[];
  totalCount: number;
  status: NewsStatus;
  error: string | null;
  refetch: () => void;
}

/**
 * 당일 AI 뉴스 타임라인 조회 훅.
 *
 * 뉴스 API 는 JWT 가 필요하므로 토큰이 없으면 요청 없이 "unauthed" 로 둔다.
 * (React Query 프로바이더 미설정 — 채팅과 동일하게 경량 fetch 로 처리)
 */
export function useNewsTimeline(): UseNewsTimelineResult {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<NewsStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!getStoredToken()) {
      setStatus("unauthed");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const data = await getNewsTimeline();
      setItems(data.items);
      setTotalCount(data.totalCount);
      setStatus("success");
    } catch (e) {
      setError(
        (e as { message?: string }).message ?? "뉴스를 불러오지 못했습니다.",
      );
      setStatus("error");
    }
  }, []);

  // 마운트 후 1회 로드. setTimeout 으로 한 틱 미뤄 effect 동기 setState 를 피한다
  // (SSR/하이드레이션 불일치 + 캐스케이드 렌더 회피).
  // 로그인/로그아웃(auth 변경) 시에도 새로고침 없이 다시 로드한다.
  useEffect(() => {
    const id = setTimeout(load, 0);
    const off = onAuthChange(() => load());
    return () => {
      clearTimeout(id);
      off();
    };
  }, [load]);

  return { items, totalCount, status, error, refetch: load };
}
