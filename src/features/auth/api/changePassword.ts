import { customInstance, type APIResponse } from "@/shared/api";
import type {
  ChangePasswordRequest,
  ChangePasswordResult,
} from "../model/types";

/**
 * PATCH /api/auth/passwords — 비밀번호 변경 (Bearer 자동 첨부).
 * 성공 시 BE 안내 메시지를 반환한다(로그인 화면 안내에 사용).
 * 401(현재 비밀번호 불일치)은 토큰 만료가 아니므로 자동 로그아웃에서 제외(skipAuthRedirect).
 */
export async function changePassword(
  body: ChangePasswordRequest,
): Promise<string> {
  const res = await customInstance<APIResponse<ChangePasswordResult>>({
    url: "/auth/passwords",
    method: "PATCH",
    data: body,
    skipAuthRedirect: true,
  });
  return res.message;
}
