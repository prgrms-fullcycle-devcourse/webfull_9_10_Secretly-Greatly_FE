import type { Market } from "@/shared/lib";
import type { Position } from "./types";

/**
 * 종목(검색결과·워치리스트) → 보유 포지션 초기값.
 * 평단가·수량은 추가 후 입력하며, price를 주면 현재가로 채운다.
 */
export function createPosition(stock: {
  code: string;
  name: string;
  market: Market;
  price?: string | number | null;
}): Position {
  const currentPrice =
    typeof stock.price === "string"
      ? Number.parseFloat(stock.price) || 0
      : (stock.price ?? 0);
  return {
    id: stock.code,
    name: stock.name,
    ticker: stock.code,
    currency: stock.market === "OVERSEAS" ? "USD" : "KRW",
    avgPrice: 0,
    quantity: 0,
    currentPrice,
  };
}
