import { create } from "zustand";

/** 즐겨찾기 종목 (BE 즐겨찾기 API 생기기 전까지 localStorage 보관). */
export interface FavoriteStock {
  code: string;
  name: string;
  market: "DOMESTIC" | "OVERSEAS" | "COIN";
}

const STORAGE_KEY = "secret.favorites";

function readStored(): FavoriteStock[] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FavoriteStock[];
  } catch {
    return null;
  }
}

function writeStored(items: FavoriteStock[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

interface FavoritesState {
  items: FavoriteStock[];
  /** 마운트 후 localStorage 복원 (초기값은 비워 SSR 하이드레이션 일치). */
  hydrate: () => void;
  isFavorite: (code: string) => boolean;
  /** 있으면 제거, 없으면 추가 (localStorage 동기화). */
  toggle: (stock: FavoriteStock) => void;
  remove: (code: string) => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: [],
  hydrate: () => {
    const stored = readStored();
    if (stored) set({ items: stored });
  },
  isFavorite: (code) => get().items.some((s) => s.code === code),
  toggle: (stock) => {
    const exists = get().items.some((s) => s.code === stock.code);
    const next = exists
      ? get().items.filter((s) => s.code !== stock.code)
      : [...get().items, stock];
    writeStored(next);
    set({ items: next });
  },
  remove: (code) => {
    const next = get().items.filter((s) => s.code !== code);
    writeStored(next);
    set({ items: next });
  },
}));
