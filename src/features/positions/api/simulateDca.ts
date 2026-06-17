import { customInstance } from "@/shared/api";
import type {
  DcaSimulateRequest,
  DcaSimulateResult,
  ResponseEnvelope,
} from "../model/types";

/** BE 엔드포인트 — apiClient baseURL "/api" 와 합쳐져 POST /api/indicators 로 요청. */
export const DCA_SIMULATE_ENDPOINT = "/indicators";

/**
 * 가상 추가매수(물타기) 시뮬레이션 — BE 평단가 보정 엔진(POST /api/indicators) 호출.
 *
 * 응답 봉투(ResponseEnvelope)에서 data(7대 지표 + formattedLog)만 추출해 반환한다.
 * 현재가는 서버 시세로 채워지므로 요청 바디(DcaSimulateRequest)에는 포함하지 않는다.
 *
 * 인증 필수(bearer) — 미로그인/만료 시 401, 해당 종목 보유 자산이 없으면 404가 내려온다.
 * 두 경우 모두 apiClient 인터셉터가 BE 메시지를 실은 에러로 reject 하므로 호출부에서 처리한다.
 */
export async function simulateDca(
  request: DcaSimulateRequest,
): Promise<DcaSimulateResult> {
  const res = await customInstance<ResponseEnvelope<DcaSimulateResult>>({
    url: DCA_SIMULATE_ENDPOINT,
    method: "POST",
    data: request,
  });
  return res.data;
}
