import { customInstance, type APIResponse } from "@/shared/api";

/** KIS 키 등록 상태 (BE KisCredentialStatusResponseDto 정합). */
export interface KisCredentialStatus {
  registered: boolean;
  /** 앞4+뒤4만 노출 (예: "PSxa****9f2c"). 미등록 시 null. */
  maskedAppKey: string | null;
  registeredAt: string | null;
}

export interface RegisterKisCredentialRequest {
  appKey: string;
  appSecret: string;
}

/**
 * BE 컨트롤러가 `{ message, data }` 를 반환하고 전역 인터셉터가 한 번 더 감싸므로
 * 응답 data 안에 또 data(KisCredentialStatus)가 들어온다. 단일 래핑도 방어적으로 처리.
 */
type KisCredentialPayload = KisCredentialStatus | { data: KisCredentialStatus };

function unwrap(payload: KisCredentialPayload): KisCredentialStatus {
  return "registered" in payload ? payload : payload.data;
}

/** GET /api/auth/kis-credential — KIS 키 등록 상태 조회 (Bearer). */
export async function getKisCredentialStatus(): Promise<KisCredentialStatus> {
  const res = await customInstance<APIResponse<KisCredentialPayload>>({
    url: "/auth/kis-credential",
    method: "GET",
  });
  return unwrap(res.data);
}

/**
 * POST /api/auth/kis-credential — KIS 키 등록 (Bearer).
 * BE가 저장 후 토큰 발급으로 키 유효성을 검증한다 (실패 시 422, 중복 시 409).
 */
export async function registerKisCredential(
  body: RegisterKisCredentialRequest,
): Promise<KisCredentialStatus> {
  const res = await customInstance<APIResponse<KisCredentialPayload>>({
    url: "/auth/kis-credential",
    method: "POST",
    data: body,
  });
  return unwrap(res.data);
}
