import { io, type Socket } from "socket.io-client";

/**
 * Stream 게이트웨이 네임스페이스.
 *
 * REST 와 달리 Socket.IO 는 프록시로 중계할 수 없어 브라우저가 게이트웨이에
 * 직접 붙는다. 채팅(`createChatSocket`)은 오리진에 바로 붙지만, Stream 은
 * `/api/v1/stream` 네임스페이스까지 포함해 연결해야 한다(문서 client example 동일).
 */
const STREAM_NAMESPACE = "/api/v1/stream";

/**
 * Stream 소켓 접속 URL(오리진 + 네임스페이스)을 만든다.
 *
 * NEXT_PUBLIC_API_URL 의 REST 용 "/api" 프리픽스를 떼어 오리진을 구한 뒤
 * 네임스페이스를 붙인다. 절대 URL 이 아니면 로컬 개발용으로 폴백한다.
 *
 *   https://host/api → https://host/api/v1/stream
 *   http://localhost:3000/api → http://localhost:3000/api/v1/stream
 */
export function resolveStreamSocketURL(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "").trim();
  const origin =
    base && /^https?:\/\//.test(base) ? base : "http://localhost:3000";
  return `${origin}${STREAM_NAMESPACE}`;
}

/**
 * 액세스 토큰을 실어 Stream 게이트웨이에 연결할 소켓을 만든다.
 *
 * BE 가 `handshake.auth.token` 으로 JWT 를 검증하므로 raw JWT 를 그대로 전달한다.
 * `autoConnect:false` — 호출부에서 리스너를 모두 등록한 뒤 `connect()` 한다.
 */
export function createAlertStreamSocket(token: string): Socket {
  return io(resolveStreamSocketURL(), {
    auth: { token },
    autoConnect: false,
    transports: ["websocket"],
  });
}
