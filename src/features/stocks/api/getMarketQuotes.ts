/** Yahoo 프록시(`/api/quotes`)가 내려주는 시세 한 종목. 미적재 시 null. */
export interface MarketQuote {
  symbol: string;
  price: number | null;
  /** 등락률 = 전일 종가 대비(당일), %. 분봉 토글의 "일간"(표준 기본). */
  changePercent: number | null;
  /** 기간별 등락률(%): 직전 15분·30분 전 대비. 분봉 토글이 골라 쓴다. */
  change15m: number | null;
  change30m: number | null;
  volume: number | null;
  /** 당일 시가·고가·저가·전일 종가 (상세 패널 지표용). */
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
}

/**
 * 우리 Next 프록시(`/api/quotes`)에서 Yahoo 시세를 받아온다 (KIS·로그인 무관).
 * apiClient(BE) 가 아니라 같은 오리진의 라우트 핸들러를 직접 부르므로 fetch 를 쓴다.
 */
export async function getMarketQuotes(
  symbols: string[],
): Promise<MarketQuote[]> {
  if (symbols.length === 0) return [];
  const res = await fetch(
    `/api/quotes?symbols=${encodeURIComponent(symbols.join(","))}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("시세 프록시 응답 오류");
  const json = (await res.json()) as { quotes: MarketQuote[] };
  return json.quotes;
}
