import { customInstance, type APIResponse } from "@/shared/api";
import type { ServerPosition } from "./types";

/** GET /api/positions — 내 종목 리스트 조회 (인증 필요). */
export async function getPositions(): Promise<ServerPosition[]> {
  const res = await customInstance<APIResponse<ServerPosition[]>>({
    url: "/positions",
    method: "GET",
  });
  return res.data;
}
