"use client";

/**
 * MarketIndicators — 하단 상태바에 위장 선행지표(KSP·NSQ·VIX·USD/KRW 등)를 출력.
 *
 * 마운트 시 `useStatusBarIndicators()` 로 GET /api/indicators/statusbar 를 호출해
 * 실데이터를 표시한다. BE 가 현재가·등락률을 "2684.50 (-0.42)" 문자열로 이미
 * 포맷(보호색 마스킹)해 내려주므로, FE 는 파싱·색상 처리 없이 그대로 출력한다.
 *
 * 스타일은 Tailwind 우선 + 디자인 토큰.
 */

import { useStatusBarIndicators } from "../model/useStatusBarIndicators";

export function MarketIndicators() {
  const indicators = useStatusBarIndicators();

  return (
    <div className="flex h-full items-center" aria-label="선행지표">
      {indicators.map((indicator) => (
        <div
          key={indicator.componentId}
          className="statusbar-item"
          title={indicator.label}
        >
          <span className="text-vscode-fg-desc">{indicator.label}</span>
          <span className="font-medium text-vscode-fg-statusbar">
            {indicator.value}
          </span>
        </div>
      ))}
    </div>
  );
}
