import { calculateAverageDown } from "./calculateDca";
import type { DcaSimulateRequest, DcaSimulateResult } from "./types";

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * BE(`POST /api/indicators`) 응답을 로컬에서 동일 계약으로 재현하는 순수 함수.
 * 백엔드 미배포 동안 사용하며, BE의 현재가는 알 수 없으므로 `marketPrice`를 주입받는다
 * (실제 연동 시 BE가 시세를 채워주므로 이 인자는 사라진다).
 */
export function simulateDcaLocal(
  request: DcaSimulateRequest,
  marketPrice: number,
): DcaSimulateResult {
  const { newAvgPrice, totalQuantity } = calculateAverageDown(request);

  const calculatedAvgPrice = round2(newAvgPrice);
  const calculatedQuantity = totalQuantity;
  const calculatedEvaluationAmount = round2(marketPrice * totalQuantity);
  const calculatedEvaluationProfit = round2(
    calculatedEvaluationAmount - newAvgPrice * totalQuantity,
  );
  const calculatedRateOfReturn =
    newAvgPrice > 0
      ? round2(((marketPrice - newAvgPrice) / newAvgPrice) * 100)
      : 0;

  const formattedLog = `[Optimizer Info] Asset '${request.code}' thread tuned. Expected AvgPrice: ${calculatedAvgPrice.toLocaleString(
    "en-US",
  )}, Total Qty: ${calculatedQuantity}, ReturnRatio: ${calculatedRateOfReturn.toFixed(
    2,
  )}. Break-even threshold optimized.`;

  return {
    code: request.code,
    currentPrice: round2(marketPrice),
    calculatedAvgPrice,
    calculatedQuantity,
    calculatedEvaluationAmount,
    calculatedEvaluationProfit,
    calculatedRateOfReturn,
    formattedLog,
  };
}
