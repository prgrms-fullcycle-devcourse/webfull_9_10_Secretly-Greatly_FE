import type { DcaSimulateRequest } from "./types";

/**
 * 물타기(추가 매수) 평단가 계산 — 순수 함수.
 *
 * newAvg = (현재평단가×보유수량 + 추가매수가×추가매수량) / (보유수량 + 추가매수량)
 *
 * BE 보정 엔진과 동일한 식이며, 로컬 목 응답(`simulateDcaLocal`) 생성에 재사용한다.
 */
export function calculateAverageDown(
  input: Pick<
    DcaSimulateRequest,
    "currentAvgPrice" | "currentQuantity" | "purchasePrice" | "purchaseQuantity"
  >,
): { newAvgPrice: number; totalQuantity: number; totalCost: number } {
  const { currentAvgPrice, currentQuantity, purchasePrice, purchaseQuantity } =
    input;

  const totalQuantity = currentQuantity + purchaseQuantity;
  const totalCost =
    currentAvgPrice * currentQuantity + purchasePrice * purchaseQuantity;
  const newAvgPrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;

  return { newAvgPrice, totalQuantity, totalCost };
}
