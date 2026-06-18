import { create } from "zustand";
import type { Market } from "@/shared/lib";

/** 시세 리스트(관심) 한 종목 — 검색에서 북마크로 가감한다. */
export interface WatchlistItem {
  code: string;
  name: string;
  market: Market;
}

const STORAGE_KEY = "secret.watchlist";

/** 초기 시세 리스트 — 요즘 핫한 종목 15개(국장 8 · 미장 7). 첫 방문 시 1회 시드. */
const DEFAULTS: WatchlistItem[] = [
  { code: "005930", name: "삼성전자", market: "DOMESTIC" },
  { code: "000660", name: "SK하이닉스", market: "DOMESTIC" },
  { code: "373220", name: "LG에너지솔루션", market: "DOMESTIC" },
  { code: "207940", name: "삼성바이오로직스", market: "DOMESTIC" },
  { code: "005380", name: "현대차", market: "DOMESTIC" },
  { code: "035720", name: "카카오", market: "DOMESTIC" },
  { code: "035420", name: "NAVER", market: "DOMESTIC" },
  { code: "000270", name: "기아", market: "DOMESTIC" },
  { code: "NVDA", name: "NVIDIA Corp.", market: "OVERSEAS" },
  { code: "AAPL", name: "Apple Inc.", market: "OVERSEAS" },
  { code: "TSLA", name: "Tesla, Inc.", market: "OVERSEAS" },
  { code: "MSFT", name: "Microsoft Corp.", market: "OVERSEAS" },
  { code: "AMZN", name: "Amazon.com Inc.", market: "OVERSEAS" },
  { code: "META", name: "Meta Platforms", market: "OVERSEAS" },
  { code: "GOOGL", name: "Alphabet Inc.", market: "OVERSEAS" },
];

function read(): WatchlistItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WatchlistItem[]) : null;
  } catch {
    return null;
  }
}

function write(items: WatchlistItem[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
}

interface WatchlistState {
  items: WatchlistItem[];
  /** 마운트 후 localStorage 복원. 첫 방문이면 기본 15종목 시드 후 저장. */
  hydrate: () => void;
  /** 있으면 제거, 없으면 추가 (검색 북마크 토글). */
  toggle: (item: WatchlistItem) => void;
  remove: (code: string) => void;
}

/**
 * 시세 리스트(관심 종목) — 로그인 무관 localStorage 보관(비회원도 유지).
 * 검색에서 북마크하면 여기에 추가되고, 시세 리스트 패널이 이걸 그린다.
 * 초기값은 기본 15종목(SSR/클라 일치) → 마운트 후 hydrate 로 저장본 반영.
 */
export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  items: DEFAULTS,
  hydrate: () => {
    const stored = read();
    if (stored) {
      set({ items: stored });
    } else {
      write(DEFAULTS);
      set({ items: DEFAULTS });
    }
  },
  toggle: (item) => {
    const exists = get().items.some((i) => i.code === item.code);
    const next = exists
      ? get().items.filter((i) => i.code !== item.code)
      : [...get().items, item];
    write(next);
    set({ items: next });
  },
  remove: (code) => {
    const next = get().items.filter((i) => i.code !== code);
    write(next);
    set({ items: next });
  },
}));
