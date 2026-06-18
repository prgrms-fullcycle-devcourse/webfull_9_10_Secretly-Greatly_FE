import { create } from "zustand";
import type { DisplayCurrency } from "@/shared/lib";

/** 표시 통화 선택 — 가격 나오는 모든 패널이 공유. (BE 무관, localStorage 보관) */
const STORAGE_KEY = "secret.currency";

function readStored(): DisplayCurrency | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "KRW" || v === "USD" ? v : null;
}

interface CurrencyState {
  currency: DisplayCurrency;
  /** 마운트 후 localStorage 복원. 사용자가 바꾼 통화는 계속 유지된다. */
  hydrate: () => void;
  setCurrency: (currency: DisplayCurrency) => void;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  // 기본은 달러($). 사용자가 바꾸면 localStorage 에 저장돼 계속 그 통화로 보인다.
  currency: "USD",
  hydrate: () => {
    const stored = readStored();
    if (stored) set({ currency: stored });
  },
  setCurrency: (currency) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, currency);
    }
    set({ currency });
  },
}));
