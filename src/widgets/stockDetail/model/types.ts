/** 워치리스트 행 클릭 시 상세 패널로 넘기는 종목 요약. WatchlistStock 과 구조 호환. */
export interface StockSummary {
  code: string;
  name: string;
  /** 현재가 (숫자 문자열, 예: "949.50") */
  price: string;
  /** 등락률 문자열 (예: "+1.30%") */
  change: string;
  /** 거래량 (예: "21.15M") */
  volume: string;
  market: "KOSPI" | "NASDAQ" | "CRYPTO";
}
