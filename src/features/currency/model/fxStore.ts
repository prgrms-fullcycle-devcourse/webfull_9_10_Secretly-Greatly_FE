import { create } from "zustand";
import { USD_KRW } from "@/shared/lib";

/**
 * USD→KRW 실시간 환율 — Yahoo `KRW=X` 프록시(`/api/fx`)에서 받아 보관.
 * 가격 환산(원/$)을 쓰는 모든 패널이 공유. 받기 전엔 상수(USD_KRW) 폴백.
 */
interface FxState {
  usdKrw: number;
  /** 마운트 후 `/api/fx` 로 실시간 환율 1회 갱신 (실패 시 폴백 유지). */
  hydrate: () => Promise<void>;
}

export const useFxStore = create<FxState>((set) => ({
  usdKrw: USD_KRW,
  hydrate: async () => {
    try {
      const res = await fetch("/api/fx", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { usdKrw: number | null };
      if (typeof json.usdKrw === "number" && json.usdKrw > 0) {
        set({ usdKrw: json.usdKrw });
      }
    } catch {
      // 실패 시 폴백 환율(USD_KRW) 유지 — 화면은 그대로 동작.
    }
  },
}));
