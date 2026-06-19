import type { Market } from "./stock";

/** 화면 표시 통화. */
export type DisplayCurrency = "KRW" | "USD";

/** USD→KRW 폴백 환율 — 실시간 환율(`/api/fx`, useFxStore) 받기 전/실패 시 기본값. */
export const USD_KRW = 1350;

/** 종목 시장의 기준(native) 통화. 미장=USD, 국장=KRW. */
export function nativeCurrency(market: Market): DisplayCurrency {
  return market === "OVERSEAS" ? "USD" : "KRW";
}

/**
 * 금액을 from 통화 → to 통화로 변환. `rate`(USD→KRW)는 실시간 환율을 넘긴다(useFxStore).
 * 안 넘기면 폴백 상수(USD_KRW) 사용.
 */
export function convertCurrency(
  value: number,
  from: DisplayCurrency,
  to: DisplayCurrency,
  rate: number = USD_KRW,
): number {
  if (from === to) return value;
  return from === "USD" ? value * rate : value / rate;
}

/**
 * 미장 종목을 원화로 표시할 때 쓸 실효 환율.
 * KIS(BE) priceKrw 가 있으면 그 종목의 원화/USD 비율을 환율로 쓴다(KIS 환율 = 정확).
 * 국장이거나 priceKrw 가 없으면 폴백(글로벌 USD→KRW) 환율을 그대로 쓴다.
 */
export function effectiveKrwRate(
  market: Market,
  priceNative: number | null | undefined,
  priceKrw: number | null | undefined,
  fallbackRate: number,
): number {
  return market === "OVERSEAS" && priceKrw != null && priceNative
    ? priceKrw / priceNative
    : fallbackRate;
}

/**
 * 시장 native 가격(숫자) → 표시 통화로 변환 후 기호 포함 문자열.
 * USD는 소수 2자리, KRW는 정수 천단위. nullish면 "—". `rate`=실시간 USD→KRW(미지정 시 폴백).
 */
export function formatPrice(
  value: number | null | undefined,
  market: Market,
  display: DisplayCurrency,
  rate: number = USD_KRW,
): string {
  if (value == null) return "—";
  const v = convertCurrency(value, nativeCurrency(market), display, rate);
  // 달러는 기호 접두($1,234), 원화는 한국식 접미(1,234원).
  return display === "USD"
    ? `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `${Math.round(v).toLocaleString("ko-KR")}원`;
}
