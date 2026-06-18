import { customInstance, type APIResponse } from "@/shared/api";
import type { CreatePositionRequest, CreatedServerPosition } from "./types";

/**
 * POST /api/positions — 내 종목 일괄 추가 (인증 필요).
 *
 * 매수 내역 배열을 보내면 BE가 stockId 기준으로 그룹핑해 평단가·총수량·총투자금액을
 * 계산한 Position 으로 저장한다.
 *
 * 주요 에러: 400(잘못된 body / GLOBAL_CHAT 등록), 401, 404(없는 종목 ID), 409(이미 등록).
 */
export async function createPositions(
  body: CreatePositionRequest[],
): Promise<CreatedServerPosition[]> {
  const res = await customInstance<APIResponse<CreatedServerPosition[]>>({
    url: "/positions",
    method: "POST",
    data: body,
  });
  return res.data;
}
