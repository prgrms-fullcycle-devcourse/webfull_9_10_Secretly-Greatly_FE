"use client";

/**
 * MarketIndicators — 하단 상태바에 위장 선행지표(KSP·NSQ·VIX·USD/KRW 등)를 출력.
 *
 * 마운트 시 `useStatusBarIndicators()` 로 GET /api/indicators/statusbar 를 호출.
 * BE 가 "9053.11 (+1.04%)" 처럼 현재가+등락률 문자열로 내려주므로, 괄호 안 등락률만
 * 분리해 상승=초록(--chart-up)·하락=빨강(--chart-down)으로 색칠한다(앱 공용 색).
 */

import { useStatusBarIndicators } from "../model/useStatusBarIndicators";

/** "9053.11 (+1.04%)" → { main: "9053.11", change: "+1.04%" }. 괄호 없으면 change=null. */
function parseIndicatorValue(value: string): {
  main: string;
  change: string | null;
} {
  const matched = value.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  if (!matched) return { main: value, change: null };
  return { main: matched[1], change: matched[2] };
}

/** 등락 부호별 색상 — 앱 전체 공용(상승 초록 / 하락 빨강). */
function changeColorClass(change: string): string {
  return change.trim().startsWith("-")
    ? "text-(--chart-down)"
    : "text-(--chart-up)";
}

export function MarketIndicators() {
  const indicators = useStatusBarIndicators();

  return (
    <div className="flex h-full items-center" aria-label="선행지표">
      {indicators.map((indicator) => {
        const { main, change } = parseIndicatorValue(indicator.value);
        return (
          <div
            key={indicator.componentId}
            className="statusbar-item"
            title={indicator.label}
          >
            <span className="text-vscode-fg-desc">{indicator.label}</span>
            <span className="font-medium text-vscode-fg-statusbar">{main}</span>
            {change !== null && (
              <span className={`font-medium ${changeColorClass(change)}`}>
                ({change})
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
