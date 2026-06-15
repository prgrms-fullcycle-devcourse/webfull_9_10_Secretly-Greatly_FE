import { io, type Socket } from "socket.io-client";

/**
 * 채팅 소켓 베이스 URL.
 *
 * Socket.IO 는 REST 와 달리 프록시로 중계할 수 없고 브라우저가 게이트웨이
 * 오리진에 직접 붙는다(HTTPS 페이지면 wss 필수). 환경변수는 NEXT_PUBLIC_API_URL
 * 하나로 통일하고, REST 용 "/api" 프리픽스를 떼어 소켓 오리진으로 쓴다.
 *
 *   예) https://secretlygreatly.duckdns.org/api → https://secretlygreatly.duckdns.org
 *       http://localhost:3000/api              → http://localhost:3000
 *
 * 절대 URL 이 아니면(미설정/상대경로) 로컬 개발용 http://localhost:3000 로 폴백한다.
 */
export function resolveChatSocketURL(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "").trim();
  if (base && /^https?:\/\//.test(base)) return base;
  return "http://localhost:3000";
}

/**
 * 액세스 토큰을 실어 채팅 게이트웨이에 연결할 소켓을 만든다.
 *
 * BE `handleConnection` 은 `handshake.auth.token` 을 `verifyAccessToken` 으로
 * 검증하므로 raw JWT 를 그대로 전달한다(Bearer 접두사 없음).
 * `autoConnect:false` — 호출부에서 리스너를 모두 등록한 뒤 `connect()` 한다.
 */
export function createChatSocket(token: string): Socket {
  return io(resolveChatSocketURL(), {
    auth: { token },
    autoConnect: false,
    transports: ["websocket"],
  });
}
