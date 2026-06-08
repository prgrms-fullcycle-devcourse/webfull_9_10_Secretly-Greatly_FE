import type { Currency } from "./types";

/** 통화 기호/소수 자릿수에 맞춰 금액 문자열로 변환 (예: 2,235,000 / $11,394.00). */
export function formatAmount(value: number, currency: Currency): string {
  if (currency === "USD") {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return Math.round(value).toLocaleString("ko-KR");
}

/** 부호 포함 손익 문자열 (통화 기호 없음, 예: +180,000 / -127,500 / +831.6). */
export function formatProfit(value: number, currency: Currency): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const num =
    currency === "USD"
      ? abs.toLocaleString("en-US", { maximumFractionDigits: 1 })
      : Math.round(abs).toLocaleString("ko-KR");
  return `${sign}${num}`;
}

/** 퍼센트 문자열 (예: +6.29%). */
export function formatPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

/** 손익/수익률 부호별 색상 클래스 (양수 청록 / 음수 빨강). */
export function profitColorClass(value: number): string {
  return value >= 0
    ? "text-terminal-cyan"
    : "text-(--vscode-editorGutter-deletedBackground)";
}
