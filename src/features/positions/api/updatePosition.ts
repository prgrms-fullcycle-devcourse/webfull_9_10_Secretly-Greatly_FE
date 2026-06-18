import { customInstance, type APIResponse } from "@/shared/api";
import type { ServerPosition } from "./types";

/** PATCH /api/positions/{positionId} 요청 — 평단가·수량 수정(둘 다 옵셔널, 최소 하나). */
export interface UpdatePositionRequest {
  averagePrice?: number;
  quantity?: number;
}

/**
 * PATCH /api/positions/{positionId} — 내 종목 평단가/수량 수정 (인증 필요).
 * totalInvestedAmount 는 BE 가 averagePrice × quantity 로 재계산해 반환한다.
 * 주요 에러: 400(수정 필드 없음), 401, 403(타인 종목), 404.
 */
export async function updatePosition(
  id: number,
  body: UpdatePositionRequest,
): Promise<ServerPosition> {
  const res = await customInstance<APIResponse<ServerPosition>>({
    url: `/positions/${id}`,
    method: "PATCH",
    data: body,
  });
  return res.data;
}
