import { create } from "zustand";
import { MOCK_POSITIONS } from "./mockData";
import type { Position } from "./types";

/** 사용자가 편집 가능한 필드 (평단가/수량). */
type EditablePositionFields = Pick<Position, "avgPrice" | "quantity">;

interface PositionsState {
  positions: Position[];
  /** 종목 추가 (id 중복이면 무시). 검색의 + 버튼이 호출. */
  addPosition: (position: Position) => void;
  /** 종목 제거. 검색 +(해제)·행 삭제 버튼이 호출. */
  removePosition: (id: string) => void;
  /** 평단가/수량 인라인 편집. */
  updatePosition: (id: string, patch: Partial<EditablePositionFields>) => void;
}

/**
 * 보유 종목 공유 스토어.
 * 검색 feature(쓰기)와 물타기 패널(읽기)의 단일 소스.
 */
export const usePositionsStore = create<PositionsState>((set) => ({
  positions: MOCK_POSITIONS,

  addPosition: (position) =>
    set((state) =>
      state.positions.some((p) => p.id === position.id)
        ? state
        : { positions: [...state.positions, position] },
    ),

  removePosition: (id) =>
    set((state) => ({
      positions: state.positions.filter((p) => p.id !== id),
    })),

  updatePosition: (id, patch) =>
    set((state) => ({
      positions: state.positions.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    })),
}));
