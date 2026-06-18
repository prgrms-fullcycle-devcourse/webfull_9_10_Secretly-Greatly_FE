import { create } from "zustand";

/** 분봉(등락률 기간) 토글 값 — 리스트·상세가 공유해 같은 기준으로 등락률을 본다.
 *  "실시간"은 BE 가 진짜 실시간(틱)을 못 줘서(30초 폴링) 제외. */
export const TIMEFRAMES = ["일간", "15분", "30분"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

interface TimeframeState {
  timeframe: Timeframe;
  setTimeframe: (timeframe: Timeframe) => void;
}

/**
 * 등락률을 어느 기간으로 볼지 — 리스트·상세가 공유하는 전역 상태.
 * 기본은 "일간"(전일 종가 대비) = 주식 사이트 표준. 토글로 15분/30분도 볼 수 있다.
 * (차트의 봉 단위와는 별개 — 그건 차트 자체에서 제어.)
 */
export const useTimeframeStore = create<TimeframeState>((set) => ({
  timeframe: "일간",
  setTimeframe: (timeframe) => set({ timeframe }),
}));
