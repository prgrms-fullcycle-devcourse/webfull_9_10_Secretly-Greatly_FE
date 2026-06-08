export type Currency = "KRW" | "USD";

/**
 * 보유 종목(포지션) — 공유 도메인 엔티티.
 * 검색(쓰기)·물타기 패널(읽기)이 함께 사용한다.
 */
export interface Position {
  /** 고유 식별자 (티커를 사용 — 중복 추가 방지) */
  id: string;
  /** 종목명 (예: "삼성전자") */
  name: string;
  /** 티커 (예: "005930.KS") */
  ticker: string;
  currency: Currency;
  /** 평단가 */
  avgPrice: number;
  /** 보유 수량 */
  quantity: number;
  /** 현재가 (시세 연동 전이면 0) */
  currentPrice: number;
}
