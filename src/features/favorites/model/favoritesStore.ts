import { create } from "zustand";
import { getStoredSession } from "@/shared/api";
import type { Market } from "@/shared/lib";
import { addFavorite, getFavorites, removeFavorite } from "../api";

/**
 * 즐겨찾기 종목.
 * - 비회원: localStorage 로 보관(code 기준).
 * - 회원: BE watchlist API. 등록(POST)엔 stockId, 해제(DELETE)엔 watchlistId 가 필요하다.
 */
export interface FavoriteStock {
  code: string;
  name: string;
  market: Market;
  /** BE 등록(POST)에 필요 — ★ 호출처(검색·시세시트)에서 제공. */
  stockId?: number;
  /** BE 해제(DELETE)에 필요 — GET/POST 응답에서 채워진다. */
  watchlistId?: number;
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
  /** 회원=BE 목록, 비회원=localStorage 복원. (ideShell 마운트·로그인 변화 시 호출) */
  hydrate: () => void;
  /** 화면에서만 비움. */
  reset: () => void;
  isFavorite: (code: string) => boolean;
  /** 있으면 해제, 없으면 등록. 회원=BE(POST/DELETE), 비회원=localStorage. */
  toggle: (stock: FavoriteStock) => void;
  /** code 로 해제 (트리 ★ 클릭). 회원=BE DELETE, 비회원=localStorage. */
  remove: (code: string) => void;
}

/**
 * 즐겨찾기 — 비회원은 localStorage, 회원은 BE(watchlist) 로 분기한다.
 * BE 경로는 응답 후 상태를 바꾼다(실패 시 ★ 상태 유지).
 */
export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: [],
  hydrate: () => {
    const token = getStoredSession()?.accessToken;
    if (token) {
      // 회원 → BE 목록. 응답 도착 전 로그아웃/계정전환되면(토큰 변경) 무시해 현재 상태를 덮지 않는다.
      void getFavorites()
        .then((items) => {
          if (getStoredSession()?.accessToken === token) set({ items });
        })
        .catch(() => {
          if (getStoredSession()?.accessToken === token) set({ items: [] });
        });
    } else {
      // 비회원 → localStorage
      set({ items: readStored() ?? [] });
    }
  },
  reset: () => set({ items: [] }),
  isFavorite: (code) => get().items.some((s) => s.code === code),
  toggle: (stock) => {
    const existing = get().items.find((s) => s.code === stock.code);

    if (getStoredSession()) {
      // 회원 → BE
      if (existing) {
        if (existing.watchlistId == null) return;
        void removeFavorite(existing.watchlistId)
          .then(() =>
            set({ items: get().items.filter((s) => s.code !== stock.code) }),
          )
          .catch(() => {});
      } else {
        if (stock.stockId == null) return; // stockId 없으면 BE 등록 불가
        void addFavorite(stock.stockId)
          .then((watchlistID) =>
            set({
              items: [...get().items, { ...stock, watchlistId: watchlistID }],
            }),
          )
          .catch(() => {});
      }
      return;
    }

    // 비회원 → localStorage
    const next = existing
      ? get().items.filter((s) => s.code !== stock.code)
      : [...get().items, stock];
    writeStored(next);
    set({ items: next });
  },
  remove: (code) => {
    const existing = get().items.find((s) => s.code === code);

    if (getStoredSession()) {
      // 회원 → BE
      if (existing?.watchlistId == null) return;
      void removeFavorite(existing.watchlistId)
        .then(() => set({ items: get().items.filter((s) => s.code !== code) }))
        .catch(() => {});
      return;
    }

    // 비회원 → localStorage
    const next = get().items.filter((s) => s.code !== code);
    writeStored(next);
    set({ items: next });
  },
}));
