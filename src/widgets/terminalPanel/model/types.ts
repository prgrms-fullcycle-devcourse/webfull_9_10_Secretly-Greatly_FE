/**
 * Stream API (Socket.IO) 타입 — BE Stream 게이트웨이와 1:1 매핑.
 * 문서: /api/v1/stream — 사용자별 실시간 급변 알림.
 */

/** 소켓 이벤트 이름 (모두 Server → Client). */
export const STREAM_SOCKET_EVENT = {
  /** 급변 조건 발생 시 서버가 전송하는 실시간 알림. */
  TERMINAL_ALERT: "terminal_alert",
  /** 연결/인증 오류 시 서버가 전송하는 오류 이벤트. */
  STREAM_ERROR: "stream_error",
} as const;

/** 알림 등급. */
export type AlertLevel = "WARN" | "CRITICAL";

/** 변동 방향. */
export type AlertType = "PRICE_UP" | "PRICE_DOWN";

/** `terminal_alert` payload. */
export interface TerminalAlert {
  level: AlertLevel;
  alertType: AlertType;
  stockCode: string;
  stockName: string;
  /** 변동률(%). PRICE_UP 양수 / PRICE_DOWN 음수. */
  changeRate: number;
  /** 사용자 표시용 메시지. */
  message: string;
  /** 터미널 UI 표시용 로그 문자열. */
  formattedLog: string;
  /** 알림 생성 시각 (UTC ISO). */
  createdAt: string;
}

/** `stream_error` payload. */
export interface StreamErrorPayload {
  message: string;
}
