export type Currency = "KRW" | "USD";

/** 보유 종목(포지션). */
export interface Position {
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
  /** 현재가 */
  currentPrice: number;
}

/** 종목 단위 지표(해당 통화 기준). */
export interface PositionMetrics {
  /** 평가액 = 현재가 × 수량 */
  marketValue: number;
  /** 매입액 = 평단가 × 수량 */
  costValue: number;
  /** 평가손익 = 평가액 - 매입액 */
  profit: number;
  /** 수익률(%) */
  profitRate: number;
}

/** 포트폴리오 합계(KRW 환산 기준). */
export interface PortfolioSummary {
  totalMarketValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitRate: number;
}

/**
 * 물타기 시뮬레이션 요청 바디.
 * (BE: POST /api/indicators — 평단가 보정 연산 엔진)
 */
export interface DcaSimulateRequest {
  /** 종목 코드 (예: "NVDA") */
  code: string;
  /** 현재 평단가 */
  currentAvgPrice: number;
  /** 보유 수량 */
  currentQuantity: number;
  /** 추가 매수가 */
  purchasePrice: number;
  /** 추가 매수량 */
  purchaseQuantity: number;
}

/** 물타기 시뮬레이션 응답 데이터(7대 지표 + 출력용 로그). */
export interface DcaSimulateResult {
  code: string;
  /** 현재가 (BE 시세 기준) */
  currentPrice: number;
  /** 예상 조정 평단가 */
  calculatedAvgPrice: number;
  /** 예상 총 수량 */
  calculatedQuantity: number;
  /** 예상 평가액 */
  calculatedEvaluationAmount: number;
  /** 예상 평가손익 */
  calculatedEvaluationProfit: number;
  /** 수익률 (% 기호 제거된 순수 소수) */
  calculatedRateOfReturn: number;
  /** 에디터 하단에 그대로 출력하는 최적화 로그 문자열 */
  formattedLog: string;
}

/** 공통 서버 응답 봉투. */
export interface ResponseEnvelope<T> {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  data: T;
  error: unknown | null;
}
