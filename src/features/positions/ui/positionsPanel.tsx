"use client";

/**
 * PositionsPanel — `positions.json` 에디터 뷰.
 *
 * 상단에 포트폴리오 요약(총 평가액·총 매입액·평가손익·수익률)을 띄우고,
 * 보유 종목을 표로 나열한다. 종목 행을 클릭하면 아래로 펼쳐지며
 * 물타기(추가 매수) 시뮬레이터가 나타난다.
 *
 * 데이터는 현재 목 데이터(`MOCK_POSITIONS`)이며, BE/시세 연동 시 교체한다.
 */

import { usePositionsStore } from "@/entities/position";
import { useFxStore } from "@/features/currency";
import { getPortfolioSummary } from "../model/metrics";
import {
  formatAmount,
  formatPct,
  formatProfit,
  profitColorClass,
} from "../model/format";
import { PositionRow, POSITION_GRID } from "./positionRow";

function SummaryItem({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex min-w-[140px] flex-col gap-1">
      <span className="text-(length:--font-size-sm) text-vscode-fg-desc">
        {label}
      </span>
      <span
        className={`font-mono text-[22px] leading-none ${accent ?? "text-vscode-fg"}`}
      >
        {value}
      </span>
    </div>
  );
}

export function PositionsPanel() {
  const positions = usePositionsStore((state) => state.positions);
  const usdKrw = useFxStore((state) => state.usdKrw);
  const summary = getPortfolioSummary(positions, usdKrw);

  return (
    <div className="flex h-full flex-col overflow-auto font-sans text-vscode-fg">
      {/* 요약 */}
      <div className="flex flex-wrap gap-x-12 gap-y-4 px-6 pb-5 pt-6">
        <SummaryItem
          label="총 평가액"
          value={`${formatAmount(summary.totalMarketValue, "KRW")} KRW`}
        />
        <SummaryItem
          label="총 매입액"
          value={formatAmount(summary.totalCost, "KRW")}
        />
        <SummaryItem
          label="평가손익"
          value={formatProfit(summary.totalProfit, "KRW")}
          accent={profitColorClass(summary.totalProfit)}
        />
        <SummaryItem
          label="수익률"
          value={formatPct(summary.totalProfitRate)}
          accent={profitColorClass(summary.totalProfitRate)}
        />
      </div>

      {/* 테이블 헤더 */}
      <div
        className={`${POSITION_GRID} border-y border-vscode-border-panel px-6 py-2 text-(length:--font-size-sm) text-vscode-fg-desc`}
      >
        <span>종목</span>
        <span className="text-right">평단가</span>
        <span className="text-right">수량</span>
        <span className="text-right">현재가</span>
        <span className="text-right">평가액</span>
        <span className="text-right">평가손익</span>
        <span className="text-right">수익률</span>
        <span />
      </div>

      {/* 종목 행 */}
      <div>
        {positions.length === 0 ? (
          <p className="px-6 py-8 text-center text-(length:--font-size-md) text-vscode-fg-desc">
            보유 종목이 없습니다. SEARCH 탭에서 + 로 종목을 추가하세요.
          </p>
        ) : (
          positions.map((position) => (
            <PositionRow key={position.id} position={position} />
          ))
        )}
      </div>

      {/* 면책 */}
      <p className="px-6 py-4 text-(length:--font-size-sm) text-vscode-fg-desc">
        행의 ▸를 펼치면 물타기(추가 매수) 시뮬레이션을 할 수 있습니다.
        <br />
        모든 결과는 단순 산술 계산이며 투자 조언이 아닙니다.
        <br />
        미국 종목은 합계에서 환율 {Math.round(usdKrw).toLocaleString("ko-KR")}
        원으로 환산했습니다.
      </p>
    </div>
  );
}
