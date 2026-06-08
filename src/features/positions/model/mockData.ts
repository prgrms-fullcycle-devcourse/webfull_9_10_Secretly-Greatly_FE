import type { Position } from "./types";

/** 데모용 보유 종목 목록. (추후 BE/시세 연동으로 교체) */
export const MOCK_POSITIONS: Position[] = [
  {
    id: "samsung",
    name: "삼성전자",
    ticker: "005930.KS",
    currency: "KRW",
    avgPrice: 68500,
    quantity: 30,
    currentPrice: 74500,
  },
  {
    id: "nvidia",
    name: "NVIDIA Corp.",
    ticker: "NVDA.US",
    currency: "USD",
    avgPrice: 880.2,
    quantity: 12,
    currentPrice: 949.5,
  },
  {
    id: "bitcoin",
    name: "비트코인",
    ticker: "BTC.KRW",
    currency: "KRW",
    avgPrice: 88200000,
    quantity: 0.12,
    currentPrice: 93250000,
  },
  {
    id: "kakao",
    name: "카카오",
    ticker: "035720.KS",
    currency: "KRW",
    avgPrice: 58400,
    quantity: 25,
    currentPrice: 53300,
  },
];
