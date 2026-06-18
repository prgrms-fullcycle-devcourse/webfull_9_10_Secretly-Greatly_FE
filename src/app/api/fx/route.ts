import { NextResponse } from "next/server";

/**
 * Yahoo Finance 환율 프록시 — USD/KRW.
 * BE 가 환율을 안 내려주고(노출 엔드포인트 없음) KIS 환율도 비활성이라,
 * 주식 시세와 같은 패턴으로 Yahoo `KRW=X`(원/달러)에서 실시간 환율을 받는다. (KIS·로그인 무관)
 *
 * GET /api/fx  →  { usdKrw: number | null }
 */

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url =
      "https://query1.finance.yahoo.com/v8/finance/chart/KRW=X?interval=1d&range=1d";
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return NextResponse.json({ usdKrw: null });

    const json = await res.json();
    const price: number | null =
      json?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
    // 비정상값(0/음수) 방어 — 환산 0으로 깨지지 않게 null 처리.
    return NextResponse.json({
      usdKrw: typeof price === "number" && price > 0 ? price : null,
    });
  } catch {
    return NextResponse.json({ usdKrw: null });
  }
}
