import { io, type Socket } from "socket.io-client";

/**
 * 채팅 소켓 베이스 URL.
 *
 * Socket.IO 는 REST 와 달리 프록시(rewrites)로 중계할 수 없고 브라우저가
 * 게이트웨이 오리진에 직접 붙는다. HTTPS 페이지에서는 반드시 wss(TLS)
 * 엔드포인트여야 하므로 소켓 주소는 별도 환경변수로 명시한다.
 *
 * 우선순위:
 *   1) NEXT_PUBLIC_SOCKET_URL  — 명시적 소켓 오리진(운영/로컬 모두 권장)
 *   2) NEXT_PUBLIC_API_URL 에서 "/api" 프리픽스 제거(절대 URL 일 때만 유효)
 *   3) http://localhost:3000   — 최후 폴백(로컬 개발용)
 *
 * 주의: NEXT_PUBLIC_API_URL 이 상대경로("/api")면 2)는 빈 문자열이 되어
 * 폴백으로 떨어지므로, 운영에서는 1) 을 반드시 설정해야 한다.
 */
export function resolveChatSocketURL(): string {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (explicit) return explicit;

  const derived = process.env.NEXT_PUBLIC_API_URL?.replace(
    /\/api\/?$/,
    "",
  ).trim();
  if (derived && /^https?:\/\//.test(derived)) return derived;

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
