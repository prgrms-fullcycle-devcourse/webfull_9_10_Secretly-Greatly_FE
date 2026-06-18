import { create } from "zustand";
import type { Position } from "./types";

/** 사용자가 편집 가능한 필드 (평단가/수량). */
type EditablePositionFields = Pick<Position, "avgPrice" | "quantity">;

/** 보유 목록은 수기 입력 개인 데이터 → localStorage 보관 (로그인·DB 무관, 브라우저 재시작에도 유지). */
const STORAGE_KEY = "secret.positions";

function readStored(): Position[] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Position[];
  } catch {
    return null;
  }
}

function writeStored(items: Position[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

interface PositionsState {
  positions: Position[];
  /** 마운트 후 localStorage 복원 (초기값은 비워 SSR 하이드레이션 일치). */
  hydrate: () => void;
  /** 종목 추가 (id 중복이면 무시). 검색·시트·상세의 + 버튼이 호출. */
  addPosition: (position: Position) => void;
  /** 종목 제거. */
  removePosition: (id: string) => void;
  /** 평단가/수량 인라인 편집 (수기 입력). */
  updatePosition: (id: string, patch: Partial<EditablePositionFields>) => void;
}

/**
 * 보유 종목(물타기) 공유 스토어 — 로그인 무관 개인 계산기.
 * 수기 입력값을 localStorage 에 보관해 비회원도 쓰고 새로고침/재시작에도 유지된다.
 */
export const usePositionsStore = create<PositionsState>((set) => ({
  positions: [],

  hydrate: () => {
    const stored = readStored();
    if (stored) set({ positions: stored });
  },

  addPosition: (position) =>
    set((state) => {
      if (state.positions.some((p) => p.id === position.id)) return state;
      const next = [...state.positions, position];
      writeStored(next);
      return { positions: next };
    }),

  removePosition: (id) =>
    set((state) => {
      const next = state.positions.filter((p) => p.id !== id);
      writeStored(next);
      return { positions: next };
    }),

  updatePosition: (id, patch) =>
    set((state) => {
      const next = state.positions.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      );
      writeStored(next);
      return { positions: next };
    }),
}));
