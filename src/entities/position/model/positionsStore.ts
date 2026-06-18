import { create } from "zustand";
import type { Position } from "./types";

/** 사용자가 편집 가능한 필드 (평단가/수량). */
type EditablePositionFields = Pick<Position, "avgPrice" | "quantity">;

interface PositionsState {
  positions: Position[];
  /** BE 동기화 결과로 목록 전체 교체 (features/positions/model/positionsSync 가 호출). */
  setPositions: (positions: Position[]) => void;
  /**
   * 평단가/수량 인라인 편집 — 로컬 전용.
   * BE 에 수정(PATCH) 엔드포인트가 없어 영속되지 않으며, 재조회 시 BE 값으로 덮인다.
   */
  updatePosition: (id: string, patch: Partial<EditablePositionFields>) => void;
}

/**
 * 보유 종목(물타기) 공유 상태 컨테이너.
 *
 * 순수 상태만 보관한다(FSD: entity 는 feature/api 를 의존하지 않음).
 * BE 조회/등록/삭제 오케스트레이션은 features/positions/model/positionsSync 에 있다.
 */
export const usePositionsStore = create<PositionsState>((set) => ({
  positions: [],

  setPositions: (positions) => set({ positions }),

  updatePosition: (id, patch) =>
    set((state) => ({
      positions: state.positions.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    })),
}));
