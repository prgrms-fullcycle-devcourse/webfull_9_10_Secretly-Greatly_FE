import { customInstance, type APIResponse } from "@/shared/api";

/**
 * DELETE /api/positions/{positionId} — 내 종목 삭제 (인증 필요).
 * 주요 에러: 401, 404(삭제할 종목 없음).
 */
export async function deletePosition(
  id: number,
): Promise<{ positionId: number }> {
  const res = await customInstance<APIResponse<{ positionId: number }>>({
    url: `/positions/${id}`,
    method: "DELETE",
  });
  return res.data;
}
