"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { getStoredToken, onAuthChange } from "@/shared/api";
import { createAlertStreamSocket } from "./streamSocket";
import {
  STREAM_SOCKET_EVENT,
  type StreamErrorPayload,
  type TerminalAlert,
} from "./types";

/** 누적 알림 상한(메모리 보호). */
const MAX_ALERTS = 200;

export type StreamStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "disconnected";

export interface UseAlertStreamResult {
  /** 수신 누적 알림(오래된 → 최신). */
  alerts: TerminalAlert[];
  status: StreamStatus;
  /** stream_error / 연결 오류 메시지. */
  error: string | null;
  /** 현재 status 로 진입한 시각(ISO). idle 시 null — 안내 줄 타임스탬프 안정화용. */
  statusAt: string | null;
  /** 로그인 여부 — 미로그인 시 호출부는 데모 스트림으로 폴백. */
  isAuthed: boolean;
}

/**
 * 실시간 급변 알림 스트림 훅 (Server → Client 수신 전용).
 *
 * 책임:
 *  1) 액세스 토큰으로 Stream 게이트웨이에 연결
 *  2) `terminal_alert` 수신 누적(상한 적용)
 *  3) `stream_error`/연결 오류 표면화
 *
 * 인증 정보는 `@/shared/api`(getStoredToken/onAuthChange)에서만 읽는다
 * (FSD: 위젯은 features/auth 를 직접 참조하지 않고 shared 만 의존).
 * 로그인/로그아웃 시 onAuthChange 로 즉시 재연결/정리한다.
 *
 * 연결은 effect 안에서 async 래핑으로 호출하고 상태 정리는 cleanup 에 모은다
 * — effect 본문에서 직접 동기 setState 를 하지 않기 위함(cascading render 방지).
 */
export function useAlertStream(): UseAlertStreamResult {
  const [alerts, setAlerts] = useState<TerminalAlert[]>([]);
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [statusAt, setStatusAt] = useState<string | null>(null);
  /** SSR/하이드레이션 불일치 방지 — 토큰은 마운트 후에 읽는다. */
  const [token, setToken] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // 토큰 동기화 — 초기 렌더는 서버·클라 모두 null 이라 하이드레이션이 일치하고,
  // 마운트 후 읽는다. 로그인/로그아웃 변경 시에도 즉시 다시 읽는다.
  useEffect(() => {
    const sync = () => setToken(getStoredToken());
    sync();
    return onAuthChange(sync);
  }, []);

  const connect = useCallback((accessToken: string) => {
    setStatus("connecting");
    setStatusAt(new Date().toISOString());
    setError(null);

    const socket = createAlertStreamSocket(accessToken);
    socketRef.current = socket;

    // 연결/재연결 성공 시 시각 기록 + 묵은 에러 줄 제거(일시적 websocket error 자동 해소).
    socket.on("connect", () => {
      setStatus("connected");
      setStatusAt(new Date().toISOString());
      setError(null);
    });

    socket.on(STREAM_SOCKET_EVENT.TERMINAL_ALERT, (payload: TerminalAlert) => {
      setAlerts((prev) => {
        const next = [...prev, payload];
        return next.length > MAX_ALERTS ? next.slice(-MAX_ALERTS) : next;
      });
    });

    socket.on(
      STREAM_SOCKET_EVENT.STREAM_ERROR,
      (payload: StreamErrorPayload) => {
        setError(payload?.message ?? "스트림 오류가 발생했습니다.");
        setStatus("error");
        setStatusAt(new Date().toISOString());
      },
    );

    socket.on("connect_error", (err: Error) => {
      setError(err?.message ?? "알림 스트림 연결에 실패했습니다.");
      setStatus("error");
      setStatusAt(new Date().toISOString());
    });

    socket.on("disconnect", () => {
      setStatus((prev) => (prev === "error" ? prev : "disconnected"));
    });

    socket.connect();
  }, []);

  /** 소켓 정리 + 누적/상태 초기화. effect cleanup 으로만 호출한다. */
  const cleanup = useCallback(() => {
    socketRef.current?.removeAllListeners();
    socketRef.current?.disconnect();
    socketRef.current = null;
    setStatus("idle");
    setStatusAt(null);
    setAlerts([]);
    setError(null);
  }, []);

  // 토큰이 있을 때만 연결. effect 본문은 async 래핑 호출만 하고,
  // 토큰 변경/로그아웃/언마운트 시 cleanup 이 정리한다.
  useEffect(() => {
    if (!token) return;
    const start = async () => connect(token);
    void start();
    return cleanup;
  }, [token, connect, cleanup]);

  return { alerts, status, error, statusAt, isAuthed: Boolean(token) };
}
