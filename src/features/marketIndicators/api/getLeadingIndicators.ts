import { MOCK_LEADING_INDICATORS } from "../model/mockData";
import type { LeadingIndicator } from "../model/types";

/** BE 엔드포인트 (배포 후 연동). */
export const LEADING_INDICATORS_ENDPOINT = "/indicators/leading";

/**
 * 선행지표 조회.
 *
 * 현재는 BE 미배포 + 선행지표 MSW 목이 없어 로컬 목 데이터를 반환한다.
 * BE(또는 MSW 핸들러) 준비 시 함수 내부만 아래로 교체하면 호출부는 그대로 둔다:
 *
 * ```ts
 * import { customInstance } from "@/shared/api/customInstance";
 * return customInstance<LeadingIndicator[]>({
 *   url: LEADING_INDICATORS_ENDPOINT, // apiClient baseURL "/api" → /api/indicators/leading
 *   method: "GET",
 * });
 * ```
 *
 * 연동 후에는 `<MarketIndicators />`를 감싸는 상위에서 이 함수를 호출(React Query 등)해
 * 결과를 `indicators` prop으로 주입하면 된다.
 */
export async function getLeadingIndicators(): Promise<LeadingIndicator[]> {
  return Promise.resolve(MOCK_LEADING_INDICATORS);
}
