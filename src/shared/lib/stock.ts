/** 시장 구분 — BE 정합: 국장(DOMESTIC) · 미장(OVERSEAS) · 코인(COIN). */
export type Market = "DOMESTIC" | "OVERSEAS" | "COIN";

/** 등락 문자열이 상승인지 (음수 부호가 아니면 상승). */
export function isUp(change: string): boolean {
  return !change.trim().startsWith("-");
}

/** 거래량 문자열("12.43M") → 숫자. */
export function parseVolume(volume: string): number {
  const unit = volume.at(-1);
  const value = Number.parseFloat(volume);
  if (Number.isNaN(value)) return 0;
  if (unit === "T") return value * 1e12;
  if (unit === "B") return value * 1e9;
  if (unit === "M") return value * 1e6;
  if (unit === "K") return value * 1e3;
  return value;
}

/** 등락률 문자열("+1.08%") → 숫자(1.08). */
export function parseChange(change: string): number {
  return Number.parseFloat(change.replace("%", "")) || 0;
}

/** 큰 수 → 단위 압축 문자열("20.08B"). */
export function compact(n: number): string {
  const units: Array<[string, number]> = [
    ["P", 1e15],
    ["T", 1e12],
    ["B", 1e9],
    ["M", 1e6],
    ["K", 1e3],
  ];
  for (const [suffix, unit] of units) {
    if (n >= unit) return `${(n / unit).toFixed(2)}${suffix}`;
  }
  return n.toFixed(2);
}

/** 시장별 가격 포맷 (미장 소수 2자리, 그 외 정수 천단위). nullish면 "—". */
export function formatByMarket(
  value: number | undefined,
  market: Market,
): string {
  if (value == null) return "—";
  return market === "OVERSEAS"
    ? value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : Math.round(value).toLocaleString("ko-KR");
}

/** 등락 부호별 색상 클래스 (상승 시안 / 하락 빨강 / 보합 회색) — 앱 전체 통일. */
export function changeColorClass(change: string): string {
  if (change.startsWith("-")) return "text-(--chart-down)";
  if (change.startsWith("+")) return "text-(--chart-up)";
  return "text-vscode-fg-desc";
}
