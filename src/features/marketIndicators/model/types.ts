/** 하단 상태바에 출력하는 선행지표(시장 지표) 한 항목. */
export interface LeadingIndicator {
  /** 식별자 (예: "KOSPI") */
  id: string;
  /** 표시 라벨 (예: "NASDAQ FUT") */
  label: string;
  /** 현재 값 */
  value: number;
  /** 등락률(%). 없으면 등락 표시를 생략 (예: VIX, USD/KRW) */
  changePercent?: number;
}
