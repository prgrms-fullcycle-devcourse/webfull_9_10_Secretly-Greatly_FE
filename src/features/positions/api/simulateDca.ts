import { simulateDcaLocal } from "../model/simulateDcaLocal";
import type { DcaSimulateRequest, DcaSimulateResult } from "../model/types";

/** BE 엔드포인트 (배포 후 연동). */
export const DCA_SIMULATE_ENDPOINT = "/api/indicators";

/**
 * 가상 추가매수(물타기) 시뮬레이션 — BE 평단가 보정 엔진 호출.
 *
 * 현재 BE 미배포라 로컬에서 동일 계약(7대 지표 + formattedLog)으로 모킹한다.
 * 배포 후 함수 내부만 아래로 교체하면 호출부(UI)는 그대로 둔다:
 *
 * ```ts
 * import { customInstance } from "@/shared/api";
 * import type { ResponseEnvelope } from "../model/types";
 * const res = await customInstance<ResponseEnvelope<DcaSimulateResult>>({
 *   url: DCA_SIMULATE_ENDPOINT,
 *   method: "POST",
 *   data: request,
 * });
 * return res.data;
 * ```
 *
 * @param marketPrice 로컬 목 전용(현재가). 실제 BE 연동 시 불필요.
 */
export async function simulateDca(
  request: DcaSimulateRequest,
  marketPrice: number,
): Promise<DcaSimulateResult> {
  // 연산 엔진 구동 연출 + 비동기 흐름 검증용 지연 (BE 연동 시 제거)
  await new Promise((resolve) => setTimeout(resolve, 220));
  return simulateDcaLocal(request, marketPrice);
}
