import { customInstance, type APIResponse } from "@/shared/api";
import type { Market } from "@/shared/lib";

/** BE GET /api/stocks/watchlist 의 즐겨찾기 한 항목 (WatchlistStockItemDto). */
interface WatchlistItemRes {
  watchlistId: number;
  stockId: number;
  displayFileName: string;
  ticker: string;
  currentPrice: number;
  fluctuationRate: number;
  volume: number;
  displayOrder: number;
}

interface WatchlistData {
  currentTimeframe: string;
  currentSortBy: string;
  totalCount: number;
  items: WatchlistItemRes[];
}

/** 즐겨찾기 목록 항목 (FavoriteStock 호환). watchlistId=해제(DELETE), stockId=BE 캔들/등록에 쓴다. */
export interface FavoriteListItem {
  code: string;
  name: string;
  market: Market;
  stockId: number;
  watchlistId: number;
}

/**
 * ticker 로 시장 추론 — 국장은 6자리 숫자 코드, 그 외 미장. (BE 응답에 market 이 없어 임시.)
 * 한계: 코인(KRW-BTC 등)은 FE Market 타입(DOMESTIC|OVERSEAS)에 COIN 이 없어 OVERSEAS 로 분류됨.
 * 정확히 하려면 BE 가 watchlist 응답에 market 을 내려줘야 함(+FE Market 타입 확장).
 */
function inferMarket(ticker: string): Market {
  return /^\d{6}$/.test(ticker) ? "DOMESTIC" : "OVERSEAS";
}

/**
 * GET /api/stocks/watchlist — 로그인 회원의 즐겨찾기 목록.
 * 전역 인터셉터 + BE 컨트롤러가 data 를 이중 래핑하므로 안쪽 data 도 방어적으로 푼다.
 * displayOrder(등록순) 정렬해서 돌려준다.
 */
export async function getFavorites(): Promise<FavoriteListItem[]> {
  const res = await customInstance<
    APIResponse<WatchlistData | { data: WatchlistData }>
  >({
    url: "/stocks/watchlist",
    method: "GET",
  });
  const payload = res.data;
  const data = "items" in payload ? payload : payload.data;
  const items = data?.items ?? [];
  return [...items]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((it) => ({
      code: it.ticker,
      name: it.displayFileName,
      market: inferMarket(it.ticker),
      stockId: it.stockId,
      watchlistId: it.watchlistId,
    }));
}
