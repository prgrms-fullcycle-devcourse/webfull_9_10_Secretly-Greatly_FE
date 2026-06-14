import { customInstance, type APIResponse } from "@/shared/api";
import type { LoginRequest, LoginResult } from "../model/types";

/** POST /api/auth/login — 성공 시 data(userId·fixedNickname·accessToken) 반환. */
export async function login(body: LoginRequest): Promise<LoginResult> {
  const res = await customInstance<APIResponse<LoginResult>>({
    url: "/api/auth/login",
    method: "POST",
    data: body,
  });
  return res.data;
}
