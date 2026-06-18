import { customInstance, type APIResponse } from "@/shared/api";

/** BE POST /api/stocks/watchlist 응답 (CreateWatchlistResponseDto). */
interface CreateWatchlistRes {
  watchlistId: number;
  stockName: string;
  totalRegisteredCount: number;
}

/**
 * POST /api/stocks/watchlist — 즐겨찾기 등록. 생성된 watchlistId 를 반환한다(해제에 사용).
 * 응답 이중 래핑 방어.
 */
export async function addFavorite(stockID: number): Promise<number> {
  const res = await customInstance<
    APIResponse<CreateWatchlistRes | { data: CreateWatchlistRes }>
  >({
    url: "/stocks/watchlist",
    method: "POST",
    data: { stockId: stockID },
  });
  const payload = res.data;
  const data = "watchlistId" in payload ? payload : payload.data;
  return data.watchlistId;
}
