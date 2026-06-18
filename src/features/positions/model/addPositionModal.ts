import { create } from "zustand";

/** 추가 모달이 대상으로 삼는 종목 정보(검색·시트·상세 공용). */
export interface AddPositionTarget {
  /** BE 종목 ID. 없으면 모달이 종목코드로 조회해 해석한다. */
  stockId?: number;
  code: string;
  name: string;
  /** 현재가 — 매수가 입력 기본값. */
  price?: string | number | null;
}

interface AddPositionModalState {
  target: AddPositionTarget | null;
  open: (target: AddPositionTarget) => void;
  close: () => void;
}

/** 보유종목 추가 모달 열림 상태(여러 진입점 → 단일 모달). */
export const useAddPositionModal = create<AddPositionModalState>((set) => ({
  target: null,
  open: (target) => set({ target }),
  close: () => set({ target: null }),
}));
