/**
 * 전체 채팅방 코드.
 *
 * BE 는 채팅방을 종목 코드(ticker)로 식별하므로 "전체 채팅"도 내부적으론
 * 고정 방 코드 하나로 동작한다. (해당 코드의 Stock·ChatRoom 이 DB 에 있어야 함)
 * 필요하면 NEXT_PUBLIC_GLOBAL_CHAT_TICKER 로 덮어쓴다.
 */
export const GLOBAL_CHAT_ROOM =
  process.env.NEXT_PUBLIC_GLOBAL_CHAT_TICKER ?? "005930";

/** 소켓 이벤트 이름 — BE ChatGateway @SubscribeMessage 와 1:1 매핑. */
export const CHAT_SOCKET_EVENT = {
  JOIN_ROOM: "join_room",
  JOINED_ROOM: "joined_room",
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  CHAT_ERROR: "chat_error",
} as const;

/** BE 가 강제하는 메시지 쿨타임(ms). 클라도 동일하게 전송 버튼을 잠가 UX 를 맞춘다. */
export const CHAT_SEND_COOLDOWN_MS = 3000;

/** 신고 누적 시 자동 블라인드되는 임계치 (BE reportChat 기준). */
export const CHAT_BLIND_THRESHOLD = 5;

/** 히스토리 조회 기본 페이지 크기 (BE 기본값과 동일). */
export const CHAT_HISTORY_PAGE_SIZE = 30;
