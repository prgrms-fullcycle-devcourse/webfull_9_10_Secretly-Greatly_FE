import { create } from "zustand";
import {
  clearStoredSession,
  getStoredSession,
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
  /** 로그인 성공 시 세션 저장 (이메일은 로그인 폼 입력값). localStorage 에도 보관. */
  setSession: (session: LoginResult, email: string) => void;
  /** 로그아웃 — 세션·토큰 제거. */
  clear: () => void;
}

/**
 * 인증 세션 단일 소스. apiClient 가 토큰을 헤더에 자동 첨부한다.
 * 초기값은 localStorage 에 저장된 세션에서 복원 (새로고침 시 유지).
 */
export const useAuthStore = create<AuthState>((set) => {
  const stored = getStoredSession();
  return {
    userId: stored?.userId ?? null,
    nickname: stored?.nickname ?? null,
    email: stored?.email ?? null,
    accessToken: stored?.accessToken ?? null,
    isAuthenticated: stored !== null,
    setSession: (session, email) => {
      const next = {
        userId: session.userId,
        nickname: session.fixedNickname,
        email,
        accessToken: session.accessToken,
      };
      setStoredSession(next);
      set({ ...next, isAuthenticated: true });
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
    },
  };
});

// 401(만료·무효 토큰) 응답 시 자동 로그아웃되도록 apiClient 에 핸들러 등록.
setUnauthorizedHandler(() => useAuthStore.getState().clear());
