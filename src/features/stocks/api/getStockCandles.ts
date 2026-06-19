import { customInstance, type APIResponse } from "@/shared/api";

export type CandleInterval = "1m" | "1d" | "1wk" | "1mo";

export interface StockCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockCandlesData {
  candles: StockCandle[];
}

export async function getStockCandles(
  stockID: number,
  interval: CandleInterval,
  limit = 250,
): Promise<StockCandle[]> {
  const res = await customInstance<
    APIResponse<StockCandlesData | { data: StockCandlesData }>
  >({
    url: `/stocks/${stockID}/candles`,
    method: "GET",
    params: {
      interval,
      limit,
    },
  });

  const payload = res.data;
  const data = "candles" in payload ? payload : payload.data;

  return data?.candles ?? [];
}
