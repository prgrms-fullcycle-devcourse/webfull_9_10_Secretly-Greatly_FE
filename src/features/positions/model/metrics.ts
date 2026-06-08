import type { Currency, Position } from "@/entities/position";
import type { PositionMetrics, PortfolioSummary } from "./types";

/** 합계 산출 시 미국(USD) 종목에 적용하는 환율. (추후 시세 연동으로 대체) */
export const FX_USD_KRW = 1368;

/** 종목 단위 지표(해당 통화 기준). */
export function getPositionMetrics(position: Position): PositionMetrics {
  const marketValue = position.currentPrice * position.quantity;
  const costValue = position.avgPrice * position.quantity;
  const profit = marketValue - costValue;
  const profitRate = costValue > 0 ? (profit / costValue) * 100 : 0;
  return { marketValue, costValue, profit, profitRate };
}

function toKrw(value: number, currency: Currency): number {
  return currency === "USD" ? value * FX_USD_KRW : value;
}

/** 포트폴리오 합계 (USD 종목은 KRW로 환산해 합산). */
export function getPortfolioSummary(positions: Position[]): PortfolioSummary {
  let totalMarketValue = 0;
  let totalCost = 0;

  for (const position of positions) {
    const { marketValue, costValue } = getPositionMetrics(position);
    totalMarketValue += toKrw(marketValue, position.currency);
    totalCost += toKrw(costValue, position.currency);
  }

  const totalProfit = totalMarketValue - totalCost;
  const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  return { totalMarketValue, totalCost, totalProfit, totalProfitRate };
}
