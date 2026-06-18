/** 시장 구분 — 국장(DOMESTIC) · 미장(OVERSEAS). */
export type Market = "DOMESTIC" | "OVERSEAS";

/** 등락 문자열이 상승인지 (음수 부호가 아니면 상승). */
export function isUp(change: string): boolean {
  return !change.trim().startsWith("-");
}

/** 거래량/금액 압축 문자열 → 숫자. 한국 단위(만/억/조)·영어 단위(K/M/B/T)·콤마 모두 인식. */
export function parseVolume(volume: string): number {
  const cleaned = volume.replace(/,/g, "");
  const value = Number.parseFloat(cleaned);
  if (Number.isNaN(value)) return 0;
  const unit = cleaned.replace(/[\d.\s-]/g, ""); // 숫자·점·공백·부호 제거 → 단위 글자만
  if (unit === "조") return value * 1e12;
  if (unit === "억") return value * 1e8;
  if (unit === "만") return value * 1e4;
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

/** 큰 수 → 영어 단위 압축 문자열("20.08B"). 달러($) 표시에 사용. */
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

/**
 * 큰 수 → 한국 단위 압축 문자열("2,605만" · "18.02조"). 원화(₩)·거래량(주식 수)에 사용.
 * 만(1e4)/억(1e8)/조(1e12) 기준. 단위값이 100 이상이면 정수 천단위, 미만이면 소수 2자리.
 */
export function compactKo(n: number): string {
  const units: Array<[string, number]> = [
    ["조", 1e12],
    ["억", 1e8],
    ["만", 1e4],
  ];
  for (const [suffix, unit] of units) {
    if (n >= unit) {
      const v = n / unit;
      const str =
        v >= 100 ? Math.round(v).toLocaleString("ko-KR") : v.toFixed(2);
      return `${str}${suffix}`;
    }
  }
  return Math.round(n).toLocaleString("ko-KR");
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
