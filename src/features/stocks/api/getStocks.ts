import { customInstance, type APIResponse } from "@/shared/api";

/** BE `/api/stocks` 종목 항목 (StockItemDto 정합). 시세(price/change/volume)는 미적재 시 null. */
export interface StockItem {
  stockId: number;
  code: string;
  name: string;
  price: number | null;
  change: number | null;
  volume: number | null;
  market: "DOMESTIC" | "OVERSEAS" | "COIN";
}

export interface GetStocksParams {
  keyword?: string;
  market?: "DOMESTIC" | "OVERSEAS" | "COIN";
  sort?: "change" | "price" | "volume";
  order?: "asc" | "desc";
}

interface StockListData {
  sortedBy: string;
  totalCount: number;
  items: StockItem[];
}

/**
 * GET /api/stocks — 종목 목록/검색.
 * BE 컨트롤러가 `{ message, data }` 를 반환하고 전역 인터셉터가 한 번 더 감싸므로,
 * 응답 data 안에 또 data(StockListData)가 들어온다. 단일 래핑도 방어적으로 처리.
 */
export async function getStocks(
  params: GetStocksParams = {},
): Promise<StockItem[]> {
  const res = await customInstance<
    APIResponse<StockListData | { data: StockListData }>
  >({
    url: "/stocks",
    method: "GET",
    params,
  });
  const payload = res.data;
  const list = "items" in payload ? payload : payload.data;
  return list?.items ?? [];
}
