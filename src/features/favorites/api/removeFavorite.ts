import { customInstance } from "@/shared/api";

/**
 * DELETE /api/stocks/watchlist/:watchlistId — 즐겨찾기 해제.
 * 응답 본문(deletedWatchlistId/remainingCount)은 쓰지 않으므로 무시한다.
 */
export async function removeFavorite(watchlistID: number): Promise<void> {
  await customInstance({
    url: `/stocks/watchlist/${watchlistID}`,
    method: "DELETE",
  });
}
