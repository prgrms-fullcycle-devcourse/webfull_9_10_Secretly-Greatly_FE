import type { TerminalAlert } from "../model";
import type { TerminalLog } from "./terminalAlertStream";

/** UTC ISO → 로컬 "HH:MM:SS" (데모 로그 줄과 동일 표기). */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

/**
 * 서버 `terminal_alert` payload → 위젯 표시용 `TerminalLog`.
 *
 * - id: payload 에 없으므로 종목코드+생성시각으로 합성(중복 키 방지).
 * - level: 서버는 WARN/CRITICAL 만 → TerminalLogLevel 부분집합이라 그대로 사용.
 * - 본문: BE 가 "터미널 UI 표시용"으로 내려주는 `formattedLog` 를 그대로 노출한다
 *   (예: "삼성전자 +4.00% 급등"). 종목명·변동률이 이미 포함돼 있어 재조합하지 않는다.
 */
export function mapAlertToLog(alert: TerminalAlert): TerminalLog {
  return {
    id: `${alert.stockCode}-${alert.createdAt}`,
    time: formatTime(alert.createdAt),
    level: alert.level,
    label: alert.formattedLog,
  };
}
