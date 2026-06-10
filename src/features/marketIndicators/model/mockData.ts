import type { LeadingIndicator } from "./types";

/** 데모용 선행지표. BE/MSW 연동 시 교체. */
export const MOCK_LEADING_INDICATORS: LeadingIndicator[] = [
  { id: "KOSPI", label: "KOSPI", value: 2680.1, changePercent: 0.42 },
  {
    id: "NASDAQ_FUT",
    label: "NASDAQ FUT",
    value: 18450.5,
    changePercent: -0.18,
  },
  { id: "VIX", label: "VIX", value: 15.42 },
  { id: "USD_KRW", label: "USD/KRW", value: 1375.2 },
];
