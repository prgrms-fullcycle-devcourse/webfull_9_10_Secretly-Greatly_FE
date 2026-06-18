import { getMarketQuotes, getStocks, toYahooSymbol } from "@/features/stocks";
import type { Market } from "@/shared/lib";
import {
  usePositionsStore,
  type Currency,
  type Position,
} from "@/entities/position";
import {
  createPositions,
  deletePosition,
  getPositions,
  updatePosition,
  type CreatePositionRequest,
  type ServerPosition,
  type UpdatePositionRequest,
} from "../api";

/**
 * BE positions 오케스트레이션 (FSD: feature 가 api·entity store 를 잇는다).
 *
 * BE 응답엔 currency·currentPrice 가 없어 FE 에서 보강한다:
 *  - market/currency 는 BE 의 market 값을 우선 사용하고, 미인식/누락 시 종목코드 패턴으로 폴백
 *    (6자리 숫자=국장/KRW, KRW-*=코인/KRW, 그 외=미장/USD)
 *  - currentPrice 는 Yahoo 프록시 시세로 채우고, 실패/누락 시 평단가로 폴백(손익 0)
 */

/** 종목코드 → 시세 심볼용 시장 추론(폴백용). */
function inferMarket(code: string): Market {
  return /^\d{6}$/.test(code) ? "DOMESTIC" : "OVERSEAS";
}

/** 종목코드 → 통화 추론(폴백용). */
function inferCurrency(code: string): Currency {
  return /^\d{6}$/.test(code) || code.startsWith("KRW-") ? "KRW" : "USD";
}

/**
 * BE market 값을 우선 사용해 통화·시세 심볼용 시장을 판정한다.
 * 미인식/누락이면 종목코드 패턴으로 폴백(BE market enum 미확정 대비).
 */
function resolveMarketInfo(server: ServerPosition): {
  currency: Currency;
  symbolMarket: Market;
} {
  switch (server.market?.toUpperCase()) {
    case "KR":
    case "DOMESTIC":
      return { currency: "KRW", symbolMarket: "DOMESTIC" };
    case "US":
    case "OVERSEAS":
      return { currency: "USD", symbolMarket: "OVERSEAS" };
    case "COIN":
      // 코인: 원화 표기, Yahoo 심볼 미지원이라 시장은 OVERSEAS 취급(.KS 미부착).
      return { currency: "KRW", symbolMarket: "OVERSEAS" };
    default:
      return {
        currency: inferCurrency(server.stockCode),
        symbolMarket: inferMarket(server.stockCode),
      };
  }
}

function toPosition(
  server: ServerPosition,
  currentPrice: number,
  currency: Currency = resolveMarketInfo(server).currency,
): Position {
  return {
    id: server.stockCode,
    positionId: server.positionId,
    stockId: server.stockId,
    name: server.stockName,
    ticker: server.stockCode,
    currency,
    avgPrice: server.averagePrice,
    quantity: server.quantity,
    currentPrice,
  };
}

/** GET /api/positions → 시세 보강 → 스토어 교체. 로그인 상태에서만 호출. */
export async function loadPositions(): Promise<void> {
  const server = await getPositions();

  // 종목당 시장정보 1회 계산(통화·심볼 공용).
  const marketInfos = server.map(resolveMarketInfo);
  const symbols = server.map((s, i) =>
    toYahooSymbol(s.stockCode, marketInfos[i].symbolMarket),
  );
  let quotes: Awaited<ReturnType<typeof getMarketQuotes>> = [];
  try {
    quotes = await getMarketQuotes(symbols);
  } catch {
    // 시세 실패 시 평단가 폴백(아래에서 처리).
  }

  const positions = server.map((s, i) => {
    const quote = quotes.find((q) => q.symbol === symbols[i]);
    return toPosition(
      s,
      quote?.price ?? s.averagePrice,
      marketInfos[i].currency,
    );
  });

  usePositionsStore.getState().setPositions(positions);
}

/** POST /api/positions (매수내역) 후 재조회로 정합성 확보. */
export async function addPositions(
  requests: CreatePositionRequest[],
): Promise<void> {
  await createPositions(requests);
  await loadPositions();
}

/**
 * 한 종목을 매수내역으로 등록. stockId 가 없으면 종목코드로 BE 조회해 해석한다
 * (상세 패널 등 stockId 미보유 진입점 대응).
 */
export async function addPositionForStock(input: {
  stockId?: number;
  code: string;
  purchasePrice: number;
  purchaseQuantity: number;
}): Promise<void> {
  let resolved = input.stockId;
  if (resolved == null) {
    const hit = (await getStocks({ keyword: input.code })).find(
      (s) => s.code === input.code,
    );
    resolved = hit?.stockId;
  }
  if (resolved == null) {
    throw new Error("종목 정보를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.");
  }
  await addPositions([
    {
      stockId: resolved,
      purchasePrice: input.purchasePrice,
      purchaseQuantity: input.purchaseQuantity,
    },
  ]);
}

/**
 * 인라인 편집(평단가/수량)을 BE 에 영속(PATCH)하고 응답으로 스토어를 갱신한다.
 * 현재가는 BE 응답에 없으므로 기존 스토어 값을 유지한다.
 * 실패 시 BE 재조회로 롤백(편집값을 서버 진실로 되돌림). 호출부로 reject 하지 않는다.
 */
export async function persistPositionEdit(
  id: number,
  patch: UpdatePositionRequest,
): Promise<void> {
  try {
    const updated = await updatePosition(id, patch);
    const { positions, setPositions } = usePositionsStore.getState();
    const existing = positions.find((p) => p.positionId === id);
    const currentPrice = existing?.currentPrice ?? updated.averagePrice;
    setPositions(
      positions.map((p) =>
        p.positionId === id ? toPosition(updated, currentPrice) : p,
      ),
    );
  } catch {
    // 저장 실패 → 서버 값으로 롤백(로컬 편집 무효화).
    await loadPositions().catch(() => {});
  }
}

/**
 * 종목코드로 해당 포지션을 찾아 DELETE. 성공(확정) 후에만 목록에서 제거한다.
 * 실패 시 BE 재조회로 정합성 복구. 호출부로 reject 하지 않는다.
 */
export async function removePositionByCode(code: string): Promise<void> {
  const { positions, setPositions } = usePositionsStore.getState();
  const target = positions.find((p) => p.id === code);
  if (!target) return;
  try {
    await deletePosition(target.positionId);
    setPositions(
      usePositionsStore.getState().positions.filter((p) => p.id !== code),
    );
  } catch {
    // 삭제 실패 → 재조회로 목록 정합성 복구(항목 유지).
    await loadPositions().catch(() => {});
  }
}

/** 로그아웃 등으로 목록 비우기. */
export function clearPositions(): void {
  usePositionsStore.getState().setPositions([]);
}
