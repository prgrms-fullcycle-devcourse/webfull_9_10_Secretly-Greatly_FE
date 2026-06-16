import { create } from "zustand";
import {
  clearStoredSession,
  getStoredSession,
  notifyAuthChange,
  setStoredSession,
  setUnauthorizedHandler,
} from "@/shared/api";
import type { LoginResult } from "./types";

interface AuthState {
  userId: string | null;
  nickname: string | null;
  /** 로그인 아이디(이메일). */
  email: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  /** 클라 마운트 후 localStorage 세션 복원 (SSR 하이드레이션 불일치 방지). */
  hydrate: () => void;
  /** 로그인 성공 시 세션 저장 (이메일은 로그인 폼 입력값). localStorage 에도 보관. */
  setSession: (session: LoginResult, email: string) => void;
  /** 로그아웃 — 세션·토큰 제거. */
  clear: () => void;
}

/**
 * 인증 세션 단일 소스. apiClient 가 토큰을 헤더에 자동 첨부한다.
 * 초기값은 항상 비로그인 — SSR/클라 마크업을 일치시키고, 저장된 세션은
 * 마운트 후 hydrate() 로 복원한다 (새로고침 시 유지).
 */
export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  nickname: null,
  email: null,
  accessToken: null,
  isAuthenticated: false,
  hydrate: () => {
    const stored = getStoredSession();
    if (!stored) return;
    set({
      userId: stored.userId,
      nickname: stored.nickname,
      email: stored.email,
      accessToken: stored.accessToken,
      isAuthenticated: true,
    });
  },
  setSession: (session, email) => {
    const next = {
      userId: session.userId,
      nickname: session.fixedNickname,
      email,
      accessToken: session.accessToken,
    };
    setStoredSession(next);
    set({ ...next, isAuthenticated: true });
    notifyAuthChange();
  },
  clear: () => {
    clearStoredSession();
    set({
      userId: null,
      nickname: null,
      email: null,
      accessToken: null,
      isAuthenticated: false,
    });
    notifyAuthChange();
  },
}));

/**
 * 401(만료·무효 토큰) 응답 시 자동 로그아웃되도록 apiClient 에 핸들러 등록.
 * import 부수효과 대신 앱 진입점(IdeShell)에서 1회 명시적으로 호출한다.
 */
export function registerAuthUnauthorizedHandler() {
  setUnauthorizedHandler(() => useAuthStore.getState().clear());
}
