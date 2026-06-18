"use client";

import { useEffect, useState } from "react";
import { getStatusBarIndicators } from "../api/getStatusBarIndicators";
import type { StatusBarIndicator } from "./types";

/**
 * 상태바 선행지표 조회 훅.
 *
 * 빈 상태로 시작해 마운트 시 1회 GET /api/indicators/statusbar 호출 → 성공 시 표시.
 * 로딩 중·실패 시에는 가짜 값을 보이지 않도록 빈 상태를 유지한다
 * (상태바 지표는 부가 정보라 실패가 치명적이지 않음).
 */
export function useStatusBarIndicators(): StatusBarIndicator[] {
  const [indicators, setIndicators] = useState<StatusBarIndicator[]>([]);

  useEffect(() => {
    let alive = true;
    void getStatusBarIndicators()
      .then((data) => {
        if (alive && data.length > 0) setIndicators(data);
      })
      .catch(() => {
        // 실패 시 목 데이터 유지.
      });
    return () => {
      alive = false;
    };
  }, []);

  return indicators;
}
