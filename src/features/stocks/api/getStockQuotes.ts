import { customInstance, type APIResponse } from "@/shared/api";
import type { MarketQuote } from "./getMarketQuotes";

/** 기간별 등락률(%). 정규장 밖·데이터 없음은 BE 가 null 로 내려준다. */
export interface StockQuoteChangeRate {
  daily: number | null;
  m15: number | null;
  m30: number | null;
}

/**
 * BE(KIS) 시세 한 종목 — `POST /api/stocks/quotes`.
 * price=native 통화(국장 KRW·미장 USD), priceKrw=원화 환산(미장은 KIS 환율 적용).
 */
export interface StockQuote {
  stockId: number;
  price: number | null;
  priceKrw: number | null;
  volume: number | null;
  changeRate: StockQuoteChangeRate;
}

interface StockQuotesData {
  quotes: StockQuote[];
}

/**
 * KIS 연동 회원의 관심 종목 시세를 BE 에서 받아온다(원화환산·기간별 등락률 포함).
 * 비KIS·게스트는 Yahoo(getMarketQuotes) 를 쓴다 — 이 함수는 stockId(BE 식별자) 필요.
 */
export async function getStockQuotes(
  stockIDs: number[],
): Promise<StockQuote[]> {
  if (stockIDs.length === 0) return [];

  const res = await customInstance<
    APIResponse<StockQuotesData | { data: StockQuotesData }>
  >({
    url: "/stocks/quotes",
    method: "POST",
    data: { stockIds: stockIDs },
  });

  const payload = res.data;
  const data = "quotes" in payload ? payload : payload.data;

  return data?.quotes ?? [];
}

/**
 * BE 시세(StockQuote) → 화면 공통 시세(MarketQuote) 변환.
 * BE 는 시·고·저·전일종가를 주지 않으므로 null(소비 측에서 등락률로 역산).
 */
export function stockQuoteToMarketQuote(
  symbol: string,
  quote: StockQuote,
): MarketQuote {
  return {
    symbol,
    price: quote.price,
    priceKrw: quote.priceKrw,
    changePercent: quote.changeRate.daily,
    change15m: quote.changeRate.m15,
    change30m: quote.changeRate.m30,
    volume: quote.volume,
    open: null,
    high: null,
    low: null,
    previousClose: null,
  };
}
