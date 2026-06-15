import { customInstance, type APIResponse } from "@/shared/api";
import type {
  ChangePasswordRequest,
  ChangePasswordResult,
} from "../model/types";

/**
 * PATCH /api/auth/passwords — 비밀번호 변경 (Bearer 자동 첨부).
 * 성공 시 BE 권장에 따라 새 비밀번호로 재로그인.
 */
export async function changePassword(
  body: ChangePasswordRequest,
): Promise<ChangePasswordResult> {
  const res = await customInstance<APIResponse<ChangePasswordResult>>({
    url: "/auth/passwords",
    method: "PATCH",
    data: body,
  });
  return res.data;
}
