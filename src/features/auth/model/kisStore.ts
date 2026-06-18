import { create } from "zustand";
import { getStoredSession } from "@/shared/api";
import { getKisCredentialStatus } from "../api/kisCredential";

/**
 * KIS(한국투자증권) 연동 여부 — 시세/차트 데이터 소스를 가른다.
 * connected=true(KIS 등록 회원) → BE(KIS 실데이터), false(비KIS 회원·비로그인) → Yahoo.
 * 로그인/연동 상태가 바뀔 때(ideShell 의 onAuthChange) hydrate 로 갱신.
 */
interface KisState {
  connected: boolean;
  /** 로그인 상태면 BE 에 KIS 등록여부 조회, 아니면 false. 실패 시 false(안전). */
  hydrate: () => Promise<void>;
  reset: () => void;
}

export const useKisStore = create<KisState>((set) => ({
  connected: false,
  hydrate: async () => {
    if (!getStoredSession()) {
      set({ connected: false });
      return;
    }
    try {
      const status = await getKisCredentialStatus();
      set({ connected: status.registered });
    } catch {
      set({ connected: false });
    }
  },
  reset: () => set({ connected: false }),
}));
