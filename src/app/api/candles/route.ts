import { NextResponse } from "next/server";

/**
 * Yahoo Finance 캔들(OHLCV) 프록시.
 * 우리 차트(Lightweight Charts)에 KIS 없이 실데이터를 그리기 위한 용도.
 * 국장(.KS)·미장 전부 커버하므로 TradingView 위젯의 KR 미지원 팝업을 피한다.
 *
 * GET /api/candles?symbol=005930.KS&interval=15m
 */

export const dynamic = "force-dynamic";

interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * 봉 주기별 조회 범위. Yahoo intraday 제약(1m≤8d, 5/15/30m≤60d, 60m≤730d)에 맞춘 기본값.
 * 일/주/월봉은 길게 본다. (Yahoo 미지원: 120m·240m·년봉 — 여기 없음.)
 */
const RANGE_FOR: Record<string, string> = {
  "1m": "1d",
  "5m": "5d",
  "15m": "5d",
  "30m": "1mo",
  "60m": "3mo",
  "1d": "1y",
  "1wk": "5y",
  "1mo": "10y",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") ?? "").trim();
  const interval = (searchParams.get("interval") ?? "1d").trim();
  if (!symbol) return NextResponse.json({ candles: [] });

  const range = RANGE_FOR[interval] ?? "1y";

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol,
    )}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return NextResponse.json({ candles: [] });

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    const ts: number[] | undefined = result?.timestamp;
    const q = result?.indicators?.quote?.[0];
    if (!Array.isArray(ts) || !q) return NextResponse.json({ candles: [] });

    const candles: Candle[] = [];
    for (let i = 0; i < ts.length; i++) {
      const open = q.open?.[i];
      const high = q.high?.[i];
      const low = q.low?.[i];
      const close = q.close?.[i];
      // 갭(null) 봉은 건너뛴다.
      if (open == null || high == null || low == null || close == null)
        continue;
      candles.push({
        time: ts[i],
        open,
        high,
        low,
        close,
        volume: q.volume?.[i] ?? 0,
      });
    }

    return NextResponse.json({ candles });
  } catch {
    return NextResponse.json({ candles: [] });
  }
}
