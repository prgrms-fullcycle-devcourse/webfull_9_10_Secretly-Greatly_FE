import type { Currency, Position } from "@/entities/position";
import { USD_KRW } from "@/shared/lib";
import type { PositionMetrics, PortfolioSummary } from "./types";

/** 종목 단위 지표(해당 통화 기준). */
export function getPositionMetrics(position: Position): PositionMetrics {
  const marketValue = position.currentPrice * position.quantity;
  const costValue = position.avgPrice * position.quantity;
  const profit = marketValue - costValue;
  const profitRate = costValue > 0 ? (profit / costValue) * 100 : 0;
  return { marketValue, costValue, profit, profitRate };
}

function toKrw(value: number, currency: Currency, rate: number): number {
  return currency === "USD" ? value * rate : value;
}

/**
 * 포트폴리오 합계 (USD 종목은 KRW로 환산해 합산).
 * `rate`=실시간 USD→KRW(useFxStore). 미지정 시 폴백 상수(USD_KRW).
 */
export function getPortfolioSummary(
  positions: Position[],
  rate: number = USD_KRW,
): PortfolioSummary {
  let totalMarketValue = 0;
  let totalCost = 0;

  for (const position of positions) {
    const { marketValue, costValue } = getPositionMetrics(position);
    totalMarketValue += toKrw(marketValue, position.currency, rate);
    totalCost += toKrw(costValue, position.currency, rate);
  }

  const totalProfit = totalMarketValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  return { totalMarketValue, totalCost, totalProfit, totalProfitRate };
}
