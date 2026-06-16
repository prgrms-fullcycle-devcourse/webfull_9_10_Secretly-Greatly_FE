"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  getStoredSession,
  getStoredToken,
  onAuthChange,
  type StoredSession,
} from "@/shared/api";
import { getChatMessages, reportChat } from "../api";
import {
  CHAT_SEND_COOLDOWN_MS,
  CHAT_SOCKET_EVENT,
  GLOBAL_CHAT_ROOM,
} from "./constants";
import { createChatSocket } from "./socketClient";
import type {
  ChatConnectionStatus,
  ChatErrorPayload,
  ChatHistoryMessage,
  ChatLogItem,
  ChatMessagePayload,
  JoinedRoomPayload,
} from "./types";

let systemSeq = 0;

/** 실시간 수신 메시지 → 로그 아이템. */
function fromRealtime(payload: ChatMessagePayload): ChatLogItem {
  return {
    ...payload,
    localId: `msg-${payload.chatId}`,
    kind: "message",
    message: payload.message,
    createdAt: payload.createdAt ?? new Date().toISOString(),
  };
}

/** 히스토리 메시지 → 로그 아이템. */
function fromHistory(message: ChatHistoryMessage): ChatLogItem {
  return {
    ...message,
    localId: `msg-${message.chatId}`,
    kind: "message",
  };
}

/** 클라 전용 시스템 안내 라인. */
function systemLine(text: string): ChatLogItem {
  systemSeq += 1;
  return {
    localId: `sys-${systemSeq}-${Date.now()}`,
    kind: "system",
    message: text,
    createdAt: new Date().toISOString(),
  };
}

export interface UseChatSocketOptions {
  /** 채팅방 코드. 미지정 시 전체 채팅방(GLOBAL_CHAT_ROOM). */
  ticker?: string;
  /** 로그인 시 자동 연결 (기본 true). */
  autoConnect?: boolean;
}

export interface UseChatSocketResult {
  status: ChatConnectionStatus;
  messages: ChatLogItem[];
  error: string | null;
  notice: string | null;
  /** 내 메시지 식별용 (저장된 세션의 userId). */
  currentUserId: string | null;
  /** 내 닉네임 (아바타/표시용). */
  currentNickname: string | null;
  isAuthed: boolean;
  /** 전송 가능 여부 (연결됨 + 쿨타임 해제). */
  canSend: boolean;
  /** 남은 쿨타임(ms). */
  cooldownRemaining: number;
  connect: () => void;
  leave: () => void;
  sendMessage: (text: string) => void;
  reportMessage: (chatId: number) => Promise<void>;
  clearFeedback: () => void;
}

/**
 * 종목별 실시간 채팅 통신 훅.
 *
 * 책임:
 *  1) 액세스 토큰으로 게이트웨이에 연결 → `join_room` 으로 방 입장
 *  2) `receive_message` 수신 누적 + REST 히스토리 병합(중복 제거)
 *  3) `send_message` 전송 + 3초 클라 쿨타임 미러링
 *  4) `chat_error`/연결 오류 표면화, 메시지 신고(REST)
 *
 * 인증 정보는 `@/shared/api`(getStoredSession/getStoredToken)에서 읽는다.
 * (FSD: features/chat 은 features/auth 를 직접 참조하지 않고 shared 만 의존)
 */
export function useChatSocket(
  options: UseChatSocketOptions = {},
): UseChatSocketResult {
  const { ticker = GLOBAL_CHAT_ROOM, autoConnect = true } = options;
  const [status, setStatus] = useState<ChatConnectionStatus>("idle");
  const [messages, setMessages] = useState<ChatLogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  /** 쿨타임 카운트다운용 현재 시각 틱(쿨타임 진행 중에만 갱신). */
  const [now, setNow] = useState(() => Date.now());
  /** SSR/하이드레이션 불일치 방지 — 세션은 마운트 후에 읽는다. */
  const [session, setSession] = useState<StoredSession | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const historyLoadedRef = useRef(false);

  // 세션 복원 — 초기 렌더는 서버·클라 모두 null(로그인 안내)이라 하이드레이션이 일치하고,
  // 마운트 후 비동기로 읽어 setState 한다(동기 effect-setState 회피).
  // 또한 로그인/로그아웃(auth 변경) 시 즉시 세션을 다시 읽어, 새로고침 없이
  // 소켓이 붙고/끊기도록 한다.
  useEffect(() => {
    const sync = async () => setSession(getStoredSession());
    void sync();
    return onAuthChange(() => void sync());
  }, []);

  const currentViewer = session?.userId ?? null;
  const isAuthed = Boolean(session?.accessToken);

  /** REST 히스토리를 불러와 현재 메시지 앞에 병합(이미 있는 chatId 는 제외). */
  const loadHistory = useCallback(async () => {
    if (historyLoadedRef.current) return;
    historyLoadedRef.current = true;
    try {
      const history = await getChatMessages(ticker);
      setMessages((prev) => {
        const existing = new Set(
          prev.filter((m) => m.chatId != null).map((m) => m.chatId),
        );
        const items = history.messages
          .slice()
          .reverse() // BE 는 최신순(desc) → 화면은 오래된 순(asc)
          .filter((m) => !existing.has(m.chatId))
          .map(fromHistory);
        return [...items, ...prev];
      });
    } catch {
      // 히스토리 실패는 치명적이지 않음 — 실시간만 이어간다(재시도 허용).
      historyLoadedRef.current = false;
    }
  }, [ticker]);

  const connect = useCallback(() => {
    const token = getStoredToken();
    if (!token) {
      setError("채팅에 참여하려면 로그인이 필요합니다.");
      setStatus("error");
      return;
    }
    if (!ticker) return;

    // 기존 연결 정리 후 새로 연결.
    socketRef.current?.removeAllListeners();
    socketRef.current?.disconnect();
    historyLoadedRef.current = false;
    setMessages([]);
    setError(null);
    setStatus("connecting");

    const socket = createChatSocket(token);
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      socket.emit(CHAT_SOCKET_EVENT.JOIN_ROOM, { ticker });
    });

    socket.on(CHAT_SOCKET_EVENT.JOINED_ROOM, (data: JoinedRoomPayload) => {
      setStatus("joined");
      setMessages((prev) => [...prev, systemLine(data.message)]);
      void loadHistory();
    });

    socket.on(CHAT_SOCKET_EVENT.RECEIVE_MESSAGE, (data: ChatMessagePayload) => {
      setMessages((prev) => {
        if (prev.some((m) => m.chatId === data.chatId)) return prev;
        return [...prev, fromRealtime(data)];
      });
    });

    socket.on(CHAT_SOCKET_EVENT.CHAT_ERROR, (data: ChatErrorPayload) => {
      setError(data?.message ?? "채팅 오류가 발생했습니다.");
    });

    socket.on("connect_error", (err: Error) => {
      setError(err?.message ?? "채팅 서버 연결에 실패했습니다.");
      setStatus("error");
    });

    socket.on("disconnect", () => {
      setStatus((prev) => (prev === "error" ? prev : "disconnected"));
    });

    socket.connect();
  }, [ticker, loadHistory]);

  const leave = useCallback(() => {
    socketRef.current?.removeAllListeners();
    socketRef.current?.disconnect();
    socketRef.current = null;
    historyLoadedRef.current = false;
    setStatus("disconnected");
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        setError("채팅 서버에 연결되어 있지 않습니다.");
        return;
      }
      if (Date.now() < cooldownUntil) return;
      setError(null);
      // BE 가 receive_message 로 되돌려 보내므로 낙관적 추가는 하지 않는다(중복 방지).
      socket.emit(CHAT_SOCKET_EVENT.SEND_MESSAGE, { ticker, message: trimmed });
      const ts = Date.now();
      setCooldownUntil(ts + CHAT_SEND_COOLDOWN_MS);
      setNow(ts);
    },
    [ticker, cooldownUntil],
  );

  const reportMessage = useCallback(async (id: number) => {
    try {
      const result = await reportChat(id);
      setNotice(result.message);
      setMessages((prev) =>
        prev.map((m) =>
          m.chatId === id
            ? {
                ...m,
                reportCount: result.currentReportCount,
                isHidden: result.isBlinded || m.isHidden,
              }
            : m,
        ),
      );
    } catch (err) {
      setError((err as { message?: string }).message ?? "신고에 실패했습니다.");
    }
  }, []);

  const clearFeedback = useCallback(() => {
    setError(null);
    setNotice(null);
  }, []);

  // 쿨타임 카운트다운 — setState 는 인터벌 콜백 안에서만(동기 effect-setState 회피).
  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const interval = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= cooldownUntil) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  // 로그인 + 티커 준비 시 자동 연결, 언마운트/티커 변경 시 정리.
  useEffect(() => {
    if (!autoConnect || !session?.accessToken || !ticker) return;
    const start = async () => connect();
    void start();
    return () => leave();
  }, [autoConnect, session?.accessToken, ticker, connect, leave]);

  const cooldownRemaining = Math.max(0, cooldownUntil - now);
  const canSend =
    (status === "joined" || status === "connected") && cooldownRemaining === 0;

  return {
    status,
    messages,
    error,
    notice,
    currentUserId: currentViewer,
    currentNickname: session?.nickname ?? null,
    isAuthed,
    canSend,
    cooldownRemaining,
    connect,
    leave,
    sendMessage,
    reportMessage,
    clearFeedback,
  };
}
