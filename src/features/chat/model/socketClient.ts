import { io, type Socket } from "socket.io-client";

/**
 * 채팅 소켓 베이스 URL.
 *
 * REST(apiClient)는 "/api" 프리픽스를 쓰지만, Socket.IO 게이트웨이는
 * 별도 네임스페이스 없이 오리진에 직접 붙으므로 환경변수에서 "/api" 를 떼어낸
 * 호스트로 연결한다.
 */
export function resolveChatSocketURL(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "");
  return base || "http://localhost:3000";
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
