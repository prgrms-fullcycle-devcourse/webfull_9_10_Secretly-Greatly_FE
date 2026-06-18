import type { Position } from "./types";

/** 데모용 초기 보유 종목 (id = 티커). 추후 BE/시세 연동으로 교체. */
export const MOCK_POSITIONS: Position[] = [
  {
    id: "005930",
    name: "삼성전자",
    ticker: "005930",
    currency: "KRW",
    avgPrice: 68500,
    quantity: 30,
    currentPrice: 74500,
  },
  {
    id: "NVDA",
    name: "NVIDIA Corp.",
    ticker: "NVDA",
    currency: "USD",
    avgPrice: 880.2,
    quantity: 12,
    currentPrice: 949.5,
  },
  {
    id: "035720",
    name: "카카오",
    ticker: "035720",
    currency: "KRW",
    avgPrice: 58400,
    quantity: 25,
    currentPrice: 53300,
  },
];
