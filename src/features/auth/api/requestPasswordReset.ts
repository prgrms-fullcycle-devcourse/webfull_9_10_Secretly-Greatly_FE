import { customInstance, type APIResponse } from "@/shared/api";
import type { PasswordResetRequest, PasswordResetResult } from "../model/types";

/**
 * POST /api/auth/passwords/reset-request — 임시 비밀번호 메일 발송 (비밀번호 찾기).
 * 비로그인 공개 엔드포인트. 성공 시 BE 안내 메시지를 반환한다(로그인 화면 안내에 사용).
 * 404(미가입 이메일) 등은 토큰 만료가 아니므로 자동 로그아웃에서 제외(skipAuthRedirect).
 */
export async function requestPasswordReset(
  body: PasswordResetRequest,
): Promise<string> {
  const res = await customInstance<APIResponse<PasswordResetResult>>({
    url: "/auth/passwords/reset-request",
    method: "POST",
    data: body,
    skipAuthRedirect: true,
  });
  return res.message;
}
