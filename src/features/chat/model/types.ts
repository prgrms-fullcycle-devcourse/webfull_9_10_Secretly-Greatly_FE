/** 메시지 종류 — BE Prisma MessageType (현재 NORMAL 만 사용). */
export type ChatMessageType = "NORMAL" | "SYSTEM" | (string & {});

/**
 * 소켓 `receive_message` 및 전송 직후 BE 가 반환하는 메시지 페이로드.
 * (ChatService.sendMessage 반환 객체와 동일 계약)
 */
export interface ChatMessagePayload {
  chatId: number;
  stockId?: number;
  ticker?: string;
  stockName?: string;
  roomId: number;
  senderId: string;
  isAnonymous?: boolean;
  nickname: string;
  message: string;
  messageType: ChatMessageType;
  formattedLog?: string;
  reportCount?: number;
  isHidden?: boolean;
  createdAt: string;
}

/** GET /api/chats/stocks/:ticker 의 개별 메시지 (ChatService.getMessagesByTicker). */
export interface ChatHistoryMessage {
  chatId: number;
  roomId: number;
  senderId: string;
  nickname: string;
  message: string;
  messageType: ChatMessageType;
  reportCount: number;
  isHidden: boolean;
  createdAt: string;
}

/** GET /api/chats/stocks/:ticker 응답 본문. */
export interface ChatHistoryResponse {
  stockId: number;
  ticker: string;
  stockName: string;
  page: number;
  limit: number;
  total: number;
  messages: ChatHistoryMessage[];
}

/** 소켓 `joined_room` 응답. */
export interface JoinedRoomPayload {
  ticker: string;
  roomName: string;
  message: string;
}

/** 소켓 `chat_error` 응답. */
export interface ChatErrorPayload {
  message: string;
}

/** PATCH /api/chats/:chatId/report 응답 본문. */
export interface ReportChatResult {
  message: string;
  chatId: number;
  currentReportCount: number;
  isBlinded: boolean;
}

/** 소켓 연결 수명주기 상태. */
export type ChatConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "joined"
  | "disconnected"
  | "error";

/**
 * 화면에 누적되는 로그 한 줄.
 * - kind "message": 실제 채팅 메시지(실시간 + 히스토리)
 * - kind "system": 입장 안내 등 클라 전용 시스템 라인
 */
export interface ChatLogItem extends Partial<ChatMessagePayload> {
  /** 렌더 key 전용 클라 식별자. */
  localId: string;
  kind: "message" | "system";
  message: string;
  createdAt: string;
}
