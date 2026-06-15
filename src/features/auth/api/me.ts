import { customInstance, type APIResponse } from "@/shared/api";
import type { MeResult } from "../model/types";

/** GET /api/auth/me — 현재 로그인 사용자 조회. JWT 검증 포함(무효 시 401). */
export async function getMe(): Promise<MeResult> {
  const res = await customInstance<APIResponse<MeResult>>({
    url: "/auth/me",
    method: "GET",
  });
  return res.data;
}
