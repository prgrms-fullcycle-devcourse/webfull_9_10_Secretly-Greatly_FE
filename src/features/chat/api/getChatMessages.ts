import { customInstance, type APIResponse } from "@/shared/api";
import { CHAT_HISTORY_PAGE_SIZE } from "../model/constants";
import type { ChatHistoryResponse } from "../model/types";

/**
 * GET /api/chats/stocks/:ticker — 특정 종목 채팅 히스토리(최신순, 페이지네이션).
 *
 * 인증 불필요(공개 엔드포인트). 종목/채팅방이 없으면 빈 `messages` 로 응답한다.
 */
export async function getChatMessages(
  ticker: string,
  page = 1,
  limit = CHAT_HISTORY_PAGE_SIZE,
): Promise<ChatHistoryResponse> {
  const res = await customInstance<APIResponse<ChatHistoryResponse>>({
    url: `/chats/stocks/${encodeURIComponent(ticker)}`,
    method: "GET",
    params: { page, limit },
  });
  return res.data;
}
