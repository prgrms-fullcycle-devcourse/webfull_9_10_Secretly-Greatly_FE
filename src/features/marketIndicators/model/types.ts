/**
 * 하단 상태바에 출력하는 위장 선행지표 한 항목.
 * BE `IndicatorComponentDto`(GET /api/indicators/statusbar) 와 정합.
 */
export interface StatusBarIndicator {
  /** 컴포넌트 고유 식별 ID (예: "status.market.kospi") — React key. */
  componentId: string;
  /** 위장 지표 단축 레이블 (예: "KSP"). */
  label: string;
  /** 보호색 마스킹된 현재가+등락률 문자열 (예: "2684.50 (-0.42)"). 서버가 포맷해 내려준다. */
  value: string;
}
