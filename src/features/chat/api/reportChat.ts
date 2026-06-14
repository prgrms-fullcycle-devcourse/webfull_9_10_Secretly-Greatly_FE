import { customInstance, type APIResponse } from "@/shared/api";
import type { ReportChatResult } from "../model/types";

/**
 * PATCH /api/chats/:chatId/report — 메시지 신고. (JwtAuthGuard — 토큰 필요)
 *
 * 같은 사용자가 중복 신고하면 409, 누적 5회 이상이면 자동 블라인드(isBlinded:true).
 * 토큰은 apiClient 인터셉터가 Authorization 헤더로 자동 첨부한다.
 */
export async function reportChat(id: number): Promise<ReportChatResult> {
  const res = await customInstance<APIResponse<ReportChatResult>>({
    url: `/api/chats/${id}/report`,
    method: "PATCH",
  });
  return res.data;
}
