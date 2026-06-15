// 공개 API — 외부(위젯)가 쓰는 ChatPanel 과 통신 훅/타입만 노출.
export { ChatPanel } from "./ui";
export { useChatSocket, GLOBAL_CHAT_ROOM } from "./model";
export type {
  UseChatSocketOptions,
  UseChatSocketResult,
  ChatMessagePayload,
  ChatHistoryResponse,
  ReportChatResult,
  ChatConnectionStatus,
  ChatLogItem,
} from "./model";
