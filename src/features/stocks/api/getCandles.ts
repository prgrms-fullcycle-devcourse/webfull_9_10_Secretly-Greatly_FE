import type { Market } from "@/shared/lib";

/** 우리 종목(code·market) → Yahoo 심볼. 국장=.KS, 미장=티커. */
export function toYahooSymbol(code: string, market: Market): string {
  if (market === "OVERSEAS") return code;
  return `${code}.KS`;
}

/** Yahoo 캔들 한 봉 (시각은 unix seconds). */
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 우리 Next 프록시(`/api/candles`)에서 Yahoo 캔들을 받아온다 (KIS·로그인 무관).
 * interval: "1m" | "15m" | "30m" | "1d".
 */
export async function getCandles(
  symbol: string,
  interval: string,
): Promise<Candle[]> {
  if (!symbol) return [];
  const res = await fetch(
    `/api/candles?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("캔들 프록시 응답 오류");
  const json = (await res.json()) as { candles: Candle[] };
  return json.candles;
}
