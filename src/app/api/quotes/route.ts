import { NextResponse } from "next/server";

/**
 * Yahoo Finance 시세 프록시.
 * 브라우저에서 Yahoo 를 직접 부르면 CORS 로 막히므로, 서버(라우트 핸들러)에서 대신 받아 JSON 으로 내려준다.
 * KIS 없이 실데이터를 우리 커스텀 시트/상세에 그리기 위한 용도 (국장 .KS / 미장 티커 커버).
 *
 * GET /api/quotes?symbols=005930.KS,AAPL
 */

export const dynamic = "force-dynamic";

interface MarketQuote {
  symbol: string;
  price: number | null;
  /** 등락률 = 전일 종가 대비(당일), %. 분봉 토글의 "일간"(표준 기본). */
  changePercent: number | null;
  /** 기간별 등락률(%): 직전 15분·30분 전 대비. 분봉 토글이 골라 쓴다. */
  change15m: number | null;
  change30m: number | null;
  volume: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
}

const EMPTY = (symbol: string): MarketQuote => ({
  symbol,
  price: null,
  changePercent: null,
  change15m: null,
  change30m: null,
  volume: null,
  open: null,
  high: null,
  low: null,
  previousClose: null,
});

/** 배열 끝에서 첫 non-null 값 (당일 봉의 open/volume 추출용). */
function lastNonNull(arr: Array<number | null> | undefined): number | null {
  if (!Array.isArray(arr)) return null;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] != null) return arr[i];
  }
  return null;
}

/**
 * 기간별 등락률(%) — "현재 시각(벽시계) 기준" `minutes` 분 전 종가 대비 마지막 체결가 변화.
 * 기준점을 now 로 잡으므로 장 마감 시엔 비교 기준이 마지막 체결가와 같아져 자연스럽게 0% 가 된다(트레이더 직관).
 * 데이터 부족(장 초반 등)이면 null → "—". 일간은 meta 로 따로 계산.
 */
function periodChangePercent(
  timestamps: Array<number> | undefined,
  closes: Array<number | null> | undefined,
  price: number | null,
  nowSec: number,
  minutes: number,
): number | null {
  if (!Array.isArray(timestamps) || !Array.isArray(closes) || price == null) {
    return null;
  }
  const target = nowSec - minutes * 60;
  for (let i = timestamps.length - 1; i >= 0; i--) {
    if (timestamps[i] <= target && closes[i] != null) {
      const ref = closes[i] as number;
      return ref === 0 ? null : ((price - ref) / ref) * 100;
    }
  }
  return null;
}

async function fetchYahooQuote(symbol: string): Promise<MarketQuote> {
  try {
    // 1분봉/당일치 — 일간 등락률(meta)과 기간별 등락률(종가열) 둘 다 한 번에 뽑는다.
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol,
    )}?interval=1m&range=1d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return EMPTY(symbol);

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta) return EMPTY(symbol);

    const price: number | null = meta.regularMarketPrice ?? null;
    const previousClose: number | null =
      meta.previousClose ?? meta.chartPreviousClose ?? null;
    const changePercent =
      price != null && previousClose
        ? ((price - previousClose) / previousClose) * 100
        : null;

    const q = result?.indicators?.quote?.[0];
    const timestamps: Array<number> | undefined = result?.timestamp;
    const closes: Array<number | null> | undefined = q?.close;
    const nowSec = Date.now() / 1000;
    const change15m = periodChangePercent(
      timestamps,
      closes,
      price,
      nowSec,
      15,
    );
    const change30m = periodChangePercent(
      timestamps,
      closes,
      price,
      nowSec,
      30,
    );

    const volume: number | null =
      meta.regularMarketVolume ?? lastNonNull(q?.volume);
    const open: number | null = lastNonNull(q?.open);
    const high: number | null =
      meta.regularMarketDayHigh ?? lastNonNull(q?.high);
    const low: number | null = meta.regularMarketDayLow ?? lastNonNull(q?.low);

    return {
      symbol,
      price,
      changePercent,
      change15m,
      change30m,
      volume,
      open,
      high,
      low,
      previousClose,
    };
  } catch {
    return EMPTY(symbol);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = (searchParams.get("symbols") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json({ quotes: [] });
  }

  const quotes = await Promise.all(symbols.map(fetchYahooQuote));
  return NextResponse.json({ quotes });
}
