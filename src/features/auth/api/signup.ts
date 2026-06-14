import { customInstance, type APIResponse } from "@/shared/api";
import type { SignupRequest, SignupResult } from "../model/types";

/** POST /api/auth — 회원가입. 성공 시 data(userId) 반환. */
export async function signup(body: SignupRequest): Promise<SignupResult> {
  const res = await customInstance<APIResponse<SignupResult>>({
    url: "/api/auth",
    method: "POST",
    data: body,
  });
  return res.data;
}
