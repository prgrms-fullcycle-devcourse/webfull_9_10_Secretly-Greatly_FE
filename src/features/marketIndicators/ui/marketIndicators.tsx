"use client";

/**
 * MarketIndicators — 하단 상태바에 선행지표(KOSPI·NASDAQ FUT·VIX·USD/KRW)를 출력.
 *
 * 순수 표현 컴포넌트: 기본은 목 데이터를 보여주고, BE/MSW 연동 시 상위에서
 * `getLeadingIndicators()` 결과를 `indicators` prop으로 주입하면 그대로 표시된다.
 *
 * 스타일은 Tailwind 우선 + 디자인 토큰. 상승=시안, 하락=빨강(앱 전체 규약과 통일).
 */

import { MOCK_LEADING_INDICATORS } from "../model/mockData";
import type { LeadingIndicator } from "../model/types";

const formatValue = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatChange = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

export interface MarketIndicatorsProps {
  /** 표시할 선행지표 (없으면 목 데이터). */
  indicators?: LeadingIndicator[];
}

export function MarketIndicators({
  indicators = MOCK_LEADING_INDICATORS,
}: MarketIndicatorsProps) {
  return (
    <div className="flex h-full items-center" aria-label="선행지표">
      {indicators.map((indicator) => (
        <div
          key={indicator.id}
          className="statusbar-item"
          title={indicator.label}
        >
          <span className="text-vscode-fg-desc">{indicator.label}</span>
          <span className="font-medium text-vscode-fg-statusbar">
            {formatValue(indicator.value)}
          </span>
          {indicator.changePercent !== undefined && (
            <span
              className={
                indicator.changePercent >= 0
                  ? "text-terminal-cyan"
                  : "text-(--vscode-editorGutter-deletedBackground)"
              }
            >
              {indicator.changePercent >= 0 ? "▲" : "▼"}{" "}
              {formatChange(indicator.changePercent)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
