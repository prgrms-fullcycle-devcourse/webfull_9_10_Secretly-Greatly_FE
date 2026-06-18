import { customInstance } from "@/shared/api";
import type { StatusBarIndicator } from "../model/types";

/** BE 엔드포인트 — apiClient baseURL "/api" 와 합쳐져 GET /api/indicators/statusbar. */
export const STATUS_BAR_INDICATORS_ENDPOINT = "/indicators/statusbar";

/**
 * GET /api/indicators/statusbar 응답 봉투.
 * 표준 래퍼(statusCode/…/error)와 달리 `{ success, message, data }` 형태다.
 */
interface StatusBarIndicatorsResponse {
  success: boolean;
  message: string;
  data: {
    totalComponents: number;
    /** 상태바용 단일 라인 문자열(미사용 — 항목 단위로 표시). */
    singleLineStream: string;
    components: StatusBarIndicator[];
  };
}

/**
 * 상태바 위장 선행지표 조회 (인증 불필요).
 *
 * BE 가 현재가·등락률을 "2684.50 (-0.42)" 같은 문자열로 이미 포맷해 내려준다
 * (보호색 마스킹). FE 는 파싱하지 않고 `components` 를 그대로 표시한다.
 */
export async function getStatusBarIndicators(): Promise<StatusBarIndicator[]> {
  const res = await customInstance<StatusBarIndicatorsResponse>({
    url: STATUS_BAR_INDICATORS_ENDPOINT,
    method: "GET",
  });
  // 응답 모양이 예상과 다를 때(예: 봉투 변경)도 throw 없이 빈 배열로 방어.
  return res.data?.components ?? [];
}
