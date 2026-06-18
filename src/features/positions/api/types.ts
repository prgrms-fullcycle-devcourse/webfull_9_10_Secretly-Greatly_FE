/** BE positions API DTO — Swagger(/api/positions) 정합. */

/** POST /api/positions 요청 한 건(매수 내역). BE가 stockId 기준 그룹핑해 평단가 계산. */
export interface CreatePositionRequest {
  /** 종목 고유 ID (검색 결과 StockItem.stockId). */
  stockId: number;
  /** 매수가. */
  purchasePrice: number;
  /** 매수 수량. */
  purchaseQuantity: number;
}

/** GET /api/positions 응답 한 항목(가장 풍부한 형태). */
export interface ServerPosition {
  positionId: number;
  stockId: number;
  stockCode: string;
  stockName: string;
  /** 시장 구분 (예: "KR"). 통화·시세 심볼 판정에 사용. 누락 시 종목코드로 폴백. */
  market?: string;
  averagePrice: number;
  quantity: number;
  totalInvestedAmount: number;
  createdAt: string;
  updatedAt: string;
}

/** POST /api/positions 응답 항목 — stockCode·생성/수정시각은 미포함. */
export type CreatedServerPosition = Omit<
  ServerPosition,
  "stockCode" | "createdAt" | "updatedAt"
>;
